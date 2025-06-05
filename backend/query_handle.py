import os
import logging
import re
import torch
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("QueryPipeline")


class QueryPipeline:
    def __init__(
        self,
        index_dir: str = "faiss_index",
        embedder_model: str = "intfloat/multilingual-e5-base",
        top_k: int = 2
    ):
        """
        Initialize the pipeline components:
          - index_dir: where our FAISS index lives
          - embedder_model: name of the HuggingFace embedding
          - top_k: number of top documents to retrieve
        """
        self.index_dir = index_dir
        self.top_k = top_k

        # 1. Initialize the HuggingFace embedder on CPU or GPU
        try:
            self.embedder = HuggingFaceEmbeddings(
                model_name=embedder_model,
                model_kwargs={"device": "cuda" if torch.cuda.is_available() else "cpu"},
            )
            logger.info(f"Embedder model '{embedder_model}' loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading embedder model '{embedder_model}': {e}")
            raise

        # 2. Load the FAISS index that was built without chunking
        try:
            self.vectorstore = FAISS.load_local(
                self.index_dir,
                self.embedder,
                allow_dangerous_deserialization=True
            )
            logger.info(f"FAISS index loaded from '{self.index_dir}'.")
        except Exception as e:
            logger.error(f"Error loading FAISS index from '{self.index_dir}': {e}")
            raise

        # 3. Prepare the “نظرة عامة” document for forced inclusion
        self.overview_doc = Document(
            page_content=(
                "• نظرة عامة\n"
                "• تأسس بنك فلسطين في عام 1960 في مدينة غزة على يد المرحوم الحاج هاشم عطا الشوا، "
                "ويُعد أول وأكبر بنك وطني في فلسطين. أُسس البنك في البداية لدعم القطاع الزراعي، "
                "وخصوصًا مزارعي الحمضيات، لكنه تطور لاحقًا ليصبح مؤسسة مالية شاملة. "
                "ويقع المقر الرئيسي للبنك في مدينة رام الله، ويدير شبكة واسعة تضم 74 فرعًا وفرعًا فرعيًا "
                "في الضفة الغربية وقطاع غزة، ويخدم أكثر من 900,000 عميل.\n"
                "• رسالة بنك فلسطين\n"
                "• تهدف رسالة البنك إلى تعزيز الخدمات المالية والمصرفية بما يتماشى مع التطورات التكنولوجية "
                "وأفضل الممارسات العالمية، مع الإسهام في تنمية فلسطين.\n"
                "• الخدمات والمنتجات\n"
                "• الخدمات المصرفية للأفراد: تشمل الحسابات الشخصية، القروض، والحلول المصرفية الرقمية.\n"
                "• الخدمات المصرفية للشركات: تشمل خدمات التمويل والاستشارات الموجهة للأعمال التجارية.\n"
                "• الخدمات الرقمية: تطبيق الهاتف المحمول \"بانكي\" يتيح إجراء المدفوعات الفورية باستخدام رموز QR، "
                "مما يزيد من راحة العملاء.\n"
                "• حلول الدفع: يوفر دعمًا لعدة عملات وطرق دفع رقمية، بما في ذلك Apple Pay.\n"
                "• برامج الولاء: برنامج \"PointCom\" يكافئ العملاء على استخدام الخدمات المصرفية الإلكترونية، "
                "ويتيح لهم استبدال النقاط لدى عدد من التجار.\n"
                "• القيادة والإدارة\n"
                "• رئيس مجلس الإدارة: السيد هاشم الشوا، الذي تولى المنصب في عام 2007، مواصلًا إرث عائلته.\n"
                "• المدير التنفيذي: السيد محمود الشوا.\n"
                "• المدير المالي: السيد صقر النمري.\n"
                "• أعضاء مجلس الإدارة: من بينهم السيدة مها عوض، القيادية في مجلس سيدات الأعمال الفلسطينيات، "
                "والدكتور نبيل قدومي، الخبير في إدارة المشاريع.\n"
                "• الأخبار والتطورات الأخيرة\n"
                "• الاستثمارات الاستراتيجية: في أغسطس 2024، استثمرت كل من مؤسسة التمويل الدولية (IFC) "
                "والبنك الأوروبي لإعادة الإعمار والتنمية (EBRD) في بنك فلسطين لدعم قاعدته الرأسمالية، "
                "وتوسيع خططه للتعافي الاقتصادي والتوسع الإقليمي.\n"
                "• دعم المشاريع الصغيرة والمتوسطة: حصل البنك على اتفاق تمويل بقيمة 65 مليون دولار بالتعاون مع IFC، "
                "وPROPARCO، وصندوق SANAD، لدعم الشركات الصغيرة والمتوسطة في فلسطين.\n"
                "• شراكات الابتكار: تعاون مع TechnoPark لتعزيز الابتكار وريادة الأعمال في فلسطين.\n"
                "• التوسع الدولي: أنشأ مكاتب تمثيلية في دبي، الإمارات العربية المتحدة، وسانتياغو، تشيلي، "
                "لخدمة الجاليات الفلسطينية وجذب الاستثمارات الأجنبية.\n"
                "• المسؤولية الاجتماعية للشركات (CSR)\n"
                "• يُعد بنك فلسطين من الرواد في المسؤولية الاجتماعية في فلسطين، حيث يخصص نحو 5٪ من صافي أرباحه "
                "للمبادرات الاجتماعية. ومن أبرز هذه البرامج:\n"
                "• حملة \"فلسطين في القلب\": تهدف إلى جمع التبرعات للإغاثة الإنسانية وجهود التعافي في غزة والضفة الغربية "
                "والقدس الشرقية.\n"
                "• الاستجابة لجائحة كوفيد-19: ساهم بمبلغ 6.5 مليون شيكل لدعم الجهود الحكومية خلال الوباء.\n"
                "• دعم التعليم: تبرع لصندوق الرئيس لدعم الطلبة الفلسطينيين في الجامعات اللبنانية.\n"
                "• الإغاثة في الكوارث: قدّم مساعدات للاجئين الفلسطينيين المتضررين من الزلزال في سوريا وتركيا.\n"
                "• التحول الرقمي والابتكار\n"
                "• مركز تقاطع الابتكار (IIH): بدعم من منحة بقيمة مليون يورو من FISEA+، يحتضن المركز حوالي 90 "
                "شركة ناشئة تقنية سنويًا، مما يعزز منظومة ريادة الأعمال الفلسطينية.\n"
                "• مبادرات التمويل الأخضر: أطلق برنامج التمويل الأخضر \"Sunref II\" بالتعاون مع PROPARCO "
                "والاتحاد الأوروبي، لتعزيز مشاريع الطاقة المستدامة.\n"
                "• الشمول المالي: حاز البنك على جائزة أفضل بنك في العالم في مجال الشمول المالي من مجلة The Banker لعام 2016.\n"
                "• معلومات الاتصال والوصول\n"
                "• المقر الرئيسي: رام الله، عين مصباح، فلسطين.\n"
                "• الفروع: 74 فرعًا وفرعًا فرعيًا في الضفة الغربية وقطاع غزة.\n"
                "• مكاتب التمثيل: دبي - الإمارات العربية المتحدة، وسانتياغو - تشيلي.\n"
                "• الخدمات الإلكترونية: منصات الخدمات المصرفية للأفراد والأعمال عبر الإنترنت.\n"
                "• الموقع الإلكتروني: www.bankofpalestine.com"
            ),
            metadata={"source": "https://www.bankofpalestine.com", "lang": "ar"}
        )

    def handleQuery(self, query: str) -> str:
        """
        Full pipeline:
          1. Embed the user’s query
          2. Search FAISS for top_k similar documents (each doc is whole text)
          3. If "نظرة عامة" appears in the query, prepend the overview_doc
          4. Return those documents’ full content concatenated, or “No relevant info” if none found.
        """
        try:
            results = []
            if "نظرة عامة" in query:
            # Ensure the overview document appears first
                results.insert(0, self.overview_doc)
                print("0000000000000000000000000000000000000000")
                print("Overview document prepended to results.")
                print("0000000000000000000000000000000000000000")
            else:
                logger.debug(f"Performing semantic search for query: '{query}'")
                results = self.vectorstore.similarity_search(query, k=self.top_k)
                logger.debug(f"Found {len(results)} documents for query: '{query}'")

          
            if not results:
                logger.warning("No results found for the query.")
                return "No relevant information found."

            # Each `doc` is already a full document, so we can grab page_content directly
            full_texts = [doc.page_content for doc in results]

            # Join them (if you want multiple docs) with a visible separator
            context = "\n\n===== DOCUMENT BOUNDARY =====\n\n".join(full_texts)
            print("context:", context)
            return context

        except Exception as e:
            logger.error(f"Error handling query '{query}': {e}")
            return "An error occurred while processing your query."


