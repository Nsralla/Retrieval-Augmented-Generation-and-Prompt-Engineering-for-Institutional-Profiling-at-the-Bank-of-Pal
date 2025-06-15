# -*- coding: utf-8 -*-

import json
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from huggingface_hub import login
import os
from langchain.schema import HumanMessage, SystemMessage
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from pathlib import Path
from langchain.schema.document import Document
from dotenv import load_dotenv


BANK_PROFILE_DOCUMENT = """
• نظرة عامة
• تأسس بنك فلسطين في عام 1960 في مدينة غزة على يد المرحوم الحاج هاشم عطا الشوا، يُعد أول وأكبر بنك وطني في فلسطين. أُسس البنك في البداية لدعم القطاع الزراعي، وخصوصًا مزارعي الحمضيات، لكنه تطور لاحقًا ليصبح مؤسسة مالية شاملة. ويقع المقر الرئيسي للبنك في مدينة رام الله، ويدير شبكة واسعة تضم 74 فرعًا وفرعًا فرعيًا في الضفة الغربية وقطاع غزة، ويخدم أكثر من 900,000 عميل.
• رسالة بنك فلسطين
• تهدف رسالة البنك إلى تعزيز الخدمات المالية والمصرفية بما يتماشى مع التطورات التكنولوجية وأفضل الممارسات العالمية، مع الإسهام في تنمية فلسطين.
• الخدمات والمنتجات
• الخدمات المصرفية للأفراد: تشمل الحسابات الشخصية، القروض، والحلول المصرفية الرقمية.
• الخدمات المصرفية للشركات: تشمل خدمات التمويل والاستشارات الموجهة للأعمال التجارية.
• الخدمات الرقمية: تطبيق الهاتف المحمول "بانكي" يتيح إجراء المدفوعات الفورية باستخدام رموز QR، مما يزيد من راحة العملاء.
• حلول الدفع: يوفر دعمًا لعدة عملات وطرق دفع رقمية، بما في ذلك Apple Pay.
• برامج الولاء: برنامج "PointCom" يكافئ العملاء على استخدام الخدمات المصرفية الإلكترونية، ويتيح لهم استبدال النقاط لدى عدد من التجار.
• القيادة والإدارة
• رئيس مجلس الإدارة: السيد هاشم الشوا، الذي تولى المنصب في عام 2007، مواصلًا إرث عائلته.
• المدير التنفيذي: السيد محمود الشوا.
• المدير المالي: السيد صقر النمري.
• أعضاء مجلس الإدارة: من بينهم السيدة مها عوض، القيادية في مجلس سيدات الأعمال الفلسطينيات، والدكتور نبيل قدومي، الخبير في إدارة المشاريع.
• الأخبار والتطورات الأخيرة
• الاستثمارات الاستراتيجية: في أغسطس 2024، استثمرت كل من مؤسسة التمويل الدولية (IFC) والبنك الأوروبي لإعادة الإعمار والتنمية (EBRD) في بنك فلسطين لدعم قاعدته الرأسمالية، وتوسيع خططه للتعافي الاقتصادي والتوسع الإقليمي.
• دعم المشاريع الصغيرة والمتوسطة: حصل البنك على اتفاق تمويل بقيمة 65 مليون دولار بالتعاون مع IFC، وPROPARCO، وصندوق SANAD، لدعم الشركات الصغيرة والمتوسطة في فلسطين.
• شراكات الابتكار: تعاون مع TechnoPark لتعزيز الابتكار وريادة الأعمال في فلسطين.
• التوسع الدولي: أنشأ مكاتب تمثيلية في دبي، الإمارات العربية المتحدة، وسانتياغو، تشيلي، لخدمة الجاليات الفلسطينية وجذب الاستثمارات الأجنبية.
• المسؤولية الاجتماعية للشركات (CSR)
• يُعد بنك فلسطين من الرواد في المسؤولية الاجتماعية في فلسطين، حيث يخصص نحو 5٪ من صافي أرباحه للمبادرات الاجتماعية. ومن أبرز هذه البرامج:
• حملة "فلسطين في القلب": تهدف إلى جمع التبرعات للإغاثة الإنسانية وجهود التعافي في غزة والضفة الغربية والقدس الشرقية.
• الاستجابة لجائحة كوفيد-19: ساهم بمبلغ 6.5 مليون شيكل لدعم الجهود الحكومية خلال الوباء.
• دعم التعليم: تبرع لصندوق الرئيس لدعم الطلبة الفلسطينيين في الجامعات اللبنانية.
• الإغاثة في الكوارث: قدّم مساعدات للاجئين الفلسطينيين المتضررين من الزلزال في سوريا وتركيا.
• التحول الرقمي والابتكار
• مركز تقاطع الابتكار (IIH): بدعم من منحة بقيمة مليون يورو من FISEA+، يحتضن المركز حوالي 90 شركة ناشئة تقنية سنويًا، مما يعزز منظومة ريادة الأعمال الفلسطينية.
• مبادرات التمويل الأخضر: أطلق برنامج التمويل الأخضر "Sunref II" بالتعاون مع PROPARCO والاتحاد الأوروبي، لتعزيز مشاريع الطاقة المستدامة.
• الشمول المالي: حاز البنك على جائزة أفضل بنك في العالم في مجال الشمول المالي من مجلة The Banker لعام 2016.
• معلومات الاتصال والوصول
• المقر الرئيسي: رام الله، عين مصباح، فلسطين.
• الفروع: 74 فرعًا وفرعًا فرعيًا في الضفة الغربية وقطاع غزة.
• مكاتب التمثيل: دبي - الإمارات العربية المتحدة، وسانتياغو - تشيلي.
• الخدمات الإلكترونية: منصات الخدمات المصرفية للأفراد والأعمال عبر الإنترنت.
• الموقع الإلكتروني: www.bankofpalestine.com
"""

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
token = os.getenv("LLAMA_KEY")
if not token:
    raise RuntimeError("LLAMA_KEY is not set in your .env")

# 3) export for Hugging Face & login
os.environ["HUGGINGFACEHUB_API_TOKEN"] = token
login(token)





BACKEND_DIR = Path(__file__).resolve().parent
DATA_PATH = BACKEND_DIR / "scraped_data" / "bop_website_cleaned.json" # Your institution data
INDEX_DIR = BACKEND_DIR / "faiss_index2"


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)
    
    
# Add this function to create a new FAISS index if needed
def create_faiss_index(documents=None, index_dir=None):
    """
    Create a new FAISS index from documents.
    
    Args:
        documents: List of documents or path to JSON file
        index_dir: Directory to save the index
    """
    if index_dir is None:
        index_dir = str(INDEX_DIR)
    
    # Process documents based on input type
    if documents is None and DATA_PATH.exists():
        # Try to load from default path
        print(f"Loading documents from {DATA_PATH}")
        documents = load_json(str(DATA_PATH))
    elif isinstance(documents, str) and os.path.exists(documents):
        # Load from provided path
        print(f"Loading documents from {documents}")
        documents = load_json(documents)
    elif not documents:
        # Create sample documents if no source is available
        print("No documents provided. Creating sample documents.")
        documents = [
            {"content": "Bank of Palestine is a leading financial institution in Palestine.", "metadata": {"source": "sample"}},
            {"content": "Founded in 1960, the bank has branches across the region.", "metadata": {"source": "sample"}},
            {"content": "The bank offers personal and business banking services.", "metadata": {"source": "sample"}},
            {"content": "Bank of Palestine has digital banking through mobile and online platforms.", "metadata": {"source": "sample"}}
        ]
    
    # Prepare documents for embedding
    texts = []
    metadatas = []
    
    # Handle different document formats
    if isinstance(documents, list):
        for doc in documents:
            if isinstance(doc, dict) and "content" in doc:
                # Format from your app.py example
                content = doc.get("content", "").strip()
                metadata = {"source": doc.get("url", doc.get("source", "unknown"))}
                
            elif isinstance(doc, dict) and "page_content" in doc:
                # LangChain Document format
                content = doc.get("page_content", "").strip()
                metadata = doc.get("metadata", {})
                
            elif isinstance(doc, Document):
                # Already LangChain Document objects
                content = doc.page_content
                metadata = doc.metadata
                
            elif isinstance(doc, str):
                # Plain text format
                content = doc.strip()
                metadata = {"source": "text_input"}
                
            else:
                # Skip invalid formats
                print(f"Skipping document with unsupported format: {type(doc)}")
                continue
                
            if content:
                texts.append(content)
                metadatas.append(metadata)
    
    if not texts:
        raise ValueError("No valid documents found to index")
    
    # Create embeddings - using the same model as in test.py
    print("Creating embeddings with sentence-transformers/all-MiniLM-L6-v2")
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Build FAISS index
    print(f"Building FAISS index with {len(texts)} documents...")
    vectorstore = FAISS.from_texts(texts, embedding=embedding_model, metadatas=metadatas)
    
    # Save the index
    print(f"Saving FAISS index to {index_dir}")
    os.makedirs(index_dir, exist_ok=True)
    vectorstore.save_local(index_dir)
    
    print(f"Successfully indexed {len(texts)} documents into FAISS at ./{index_dir}")
    return vectorstore


# Load Vector DB
def load_vector_db():
    # Make sure to use the EXACT same model name and parameters 
    # that were used to create the FAISS index
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # If you're still getting dimension mismatches, you may need to recreate the index
    try:
        db = FAISS.load_local(str(INDEX_DIR), 
                             embeddings=embedding_model, 
                             allow_dangerous_deserialization=True)
        return db
    except AssertionError:
        print("Dimension mismatch between embeddings and index. You may need to recreate the index.")
        # You can add fallback behavior here
        raise
def retrieve_context(query, k=5):
    try:
        db = load_vector_db()
        results = db.similarity_search(query, k=k-1)  # Get one less result to make room for our fixed document
        context = [doc.page_content for doc in results]
        
        # Always add the Bank of Palestine profile document
        context.insert(0, BANK_PROFILE_DOCUMENT)  # Insert at beginning for higher priority
        
        return context
    except Exception as e:
        print(f"Error in vector search: {e}")
        # Even if vector search fails, still return the bank profile
        return [BANK_PROFILE_DOCUMENT]


# Assemble the prompt with better error handling
def generate_prompt(query):
    try:
        base_dir = Path(__file__).resolve().parent
        reviews_path = base_dir / "data" / "bank_reviews.json"
        ratings_path = base_dir / "data" / "stars.json"
        branches_path = base_dir / "data" / "voting.json"
        
        # Add fallbacks for missing files
        reviews = []
        ratings = []
        branches = []
        
        try:
            if reviews_path.exists():
                reviews = load_json(str(reviews_path))
            else:
                print(f"Warning: Reviews file not found at {reviews_path}")
        except Exception as e:
            print(f"Error loading reviews: {e}")
            
        try:
            if ratings_path.exists():
                ratings = load_json(str(ratings_path))
            else:
                print(f"Warning: Ratings file not found at {ratings_path}")
        except Exception as e:
            print(f"Error loading ratings: {e}")
            
        try:
            if branches_path.exists():
                branches = load_json(str(branches_path))
            else:
                print(f"Warning: Branches file not found at {branches_path}")
        except Exception as e:
            print(f"Error loading branches: {e}")
        
        # Handle reviews more safely
        top_reviews = []
        for r in reviews[:36]:  # Try more reviews in case some don't have the key
            if "review" in r:
                top_reviews.append(r["review"])
        top_reviews_text = "\n".join(top_reviews) if top_reviews else "No reviews available"
        
        # Handle branches more safely
        branch_names = []
        for branch in branches:
            if isinstance(branch, dict) and "location" in branch:
                branch_names.append(branch["location"])
        branch_names_text = ", ".join(branch_names) if branch_names else "No branch information available"
        
        # Handle ratings more safely
        rating_summary = []
        for r in ratings:
            if isinstance(r, dict) and "location" in r and "star" in r:
                rating_summary.append(f"{r['location']}: {r['star']}★")
        rating_summary_text = "\n".join(rating_summary) if rating_summary else "No rating information available"
        
        # Try to get context, but provide fallback if FAISS fails
        try:
            context = retrieve_context(query)
            context_text = chr(10).join(context)
        except Exception as e:
            print(f"Error retrieving context: {e}")
            context_text = "Unable to retrieve context information."
        
        return f"""
اكتب نبذة تعريفية شاملة عن المؤسسة بناءً على المعلومات التالية:

معلومات وصفية عن المؤسسة:
{context_text}

ملخص التقييمات:
{top_reviews_text}

تقييمات الفروع:
{rating_summary_text}

الفروع:
{branch_names_text}

قم بإنشاء ملف تعريفي منظم يتضمن العناوين التالية باللغة العربية:
- نظرة عامة
- انطباع العملاء (من التقييمات)
- قائمة الفروع 
- تقييمات الفروع (هام: يجب تضمين جميع تقييمات الفروع المذكورة أعلاه)
- نقاط القوة
- نقاط الضعف
- الخدمات المقدمة (إن وجدت)
- التحديثات الأخيرة

يجب أن تكون إجابتك باللغة العربية بالكامل، وأن تتضمن قسماً خاصاً بعنوان "تقييمات الفروع" يحتوي على جميع التقييمات المذكورة.
"""
    except Exception as e:
        print(f"Error generating prompt: {e}")
        return "Unable to generate institution profile due to data processing errors."

# First create the endpoint
endpoint = HuggingFaceEndpoint(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    task="text-generation",
    temperature=0.3,
    max_new_tokens=2048
)

# Then pass it to ChatHuggingFace
llm = ChatHuggingFace(llm=endpoint)



# Update the generate_institution_profile function to verify ratings are included
def generate_institution_profile():
    try:
        prompt = generate_prompt("قدم ملفاً تعريفياً كاملاً عن بنك فلسطين")
        messages = [
            SystemMessage(content="أنت مساعد متخصص في بناء ملفات تعريفية للمؤسسات المالية. اكتب إجابتك باللغة العربية فقط. يجب عليك تضمين جميع تقييمات الفروع في ردك."),
            HumanMessage(content=prompt)
        ]
        
        # Get the model's response
        response = llm.invoke(messages).content
        
        # Use absolute path for ratings
        base_dir = Path(__file__).resolve().parent
        ratings_path = base_dir / "data" / "stars.json"
        rating_summary = []
        
        try:
            if ratings_path.exists():
                ratings = load_json(str(ratings_path))
                for r in ratings:
                    if isinstance(r, dict) and "location" in r and "star" in r:
                        rating_summary.append(f"{r['location']}: {r['star']}★")
        except Exception as e:
            print(f"Error loading ratings for verification: {e}")
        
        # If ratings aren't in the response, add them
        if not any(rating in response for rating in rating_summary) and rating_summary:
            rating_section = "\n\n## تقييمات الفروع\n" + "\n".join(rating_summary)
        
        # Add the ratings section if it doesn't exist
            if "Branch Ratings" not in response and "تقييمات الفروع" not in response:
                response += rating_section
        print("////////////")
        print(response)
        return response
        
    except Exception as e:
        print(f"Error generating institution profile: {e}")
        return f"Unable to generate profile due to an error: {str(e)}"

# Function to create the index and update your test.py to use it
def initialize_vector_store():
    """Create a new FAISS index if it doesn't exist, or ensure it's compatible."""
    index_path = INDEX_DIR / "index.faiss"
    
    if not INDEX_DIR.exists() or not index_path.exists():
        print("FAISS index not found. Creating new index...")
        create_faiss_index()
        return True
    else:
        print("FAISS index already exists.")
        return False   
# When you need to create/recreate the index
# initialize_vector_store()
# profile = generate_institution_profile()
# print(profile)