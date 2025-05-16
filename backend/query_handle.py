# Description: use langchain to : 1- accept user query, 2- embed it, 3- perform semantic search over vector db, 4- retrieve top k similar chunks, 5- inject them into a prompt, 6- call OpenAI and return the response
import os
import logging
import torch
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage



logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("QueryPipeline")




# ------------------------------------------------------------------------------
# Configure logging for debugging
# ------------------------------------------------------------------------------

# Query handling pipeline
class QueryPipeline:
    def __init__(self,
                 index_dir: str ="faiss_index",
                 embedder_model: str = "intfloat/multilingual-e5-base",

                 top_k: int = 3):
        """
        Initialize the pipeline components:
          - FAISS vector store location
          - HuggingFace embedder for queries
          - OpenAI chat model for generation
          - Number of top documents to retrieve
        """
        self.index_dir = index_dir
        self.top_k = top_k
        
        #1- init embedder (multilingual)
        try:
            self.embedder = HuggingFaceEmbeddings(
                model_name=embedder_model,
                model_kwargs={"device": "cuda" if torch.cuda.is_available() else "cpu"},
            )
            logger.info(f"Embedder model {embedder_model} loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading embedder model {embedder_model}: {e}")
            raise
        
        # 2- load FAISS index from disk
        try:
            self.vectorstore = FAISS.load_local(self.index_dir, self.embedder, allow_dangerous_deserialization=True)
            logger.info(f"FAISS index loaded from {self.index_dir}.")
        except Exception as e:
            logger.error(f"Error loading FAISS index from {self.index_dir}: {e}")
            raise
        
        # 3- init OpenAI chat model
        # try:
        #     self.chat_model = ChatOpenAI(
        #         model_name=openai_model,
        #         temperature=0.0,
        #         openai_api_key=os.getenv("OPENAI_API_KEY"),
        #     )
        #     logger.info(f"OpenAI model {openai_model} initialized successfully.")
        # except Exception as e:
        #     logger.error(f"Error initializing OpenAI model {openai_model}: {e}")
        #     raise
        
        
    def handleQuery(self, query: str) :
            """
            Full pipeline:
            1. Embed user query
            2. Search FAISS for top-K similar chunks
            3. Inject chunks into a prompt
            4. Call OpenAI and return the response
            """
        
         # 1- SEMANTIC SEARCH
            try:
                logger.debug(f"Performing semantic search for query: {query}")
                results = self.vectorstore.similarity_search(query, k=self.top_k)
                logger.debug(f"Found {len(results)} results for query: {query}")
                if not results:
                    logger.warning("No results found for the query.")
                    return "No relevant information found."
        # 2- prepare contet text by concatenating chuck contents
                context_text = [doc.page_content for doc in results]
                context = "\n\n--\n\n".join(context_text)
                # logger.debug(f"Context text prepared for OpenAI: {context}...")  # Log first 100 chars
                return context
        # 3- build message for chatopen ai
                # system_prompt = (
                #     "You are a helpful assistant for the Bank of Palestine. "
                #     "Use the provided context to answer the user's question as accurately as possible."
                # )
                # messages = [
                #     SystemMessage(content=system_prompt),
                #     HumanMessage(content=f"Context: \n{context}\n\nQuestion:{query}"),

                # ]
                # logger.debug(f"Messages prepared for OpenAI: {messages}")
            
                # # 4- call OpenAI and get the response
                # response = self.chat_model.invoke(messages)
                # logger.debug(f"OpenAI response: {response.content}")
                # return response.content 
            except Exception as e:
                logger.error(f"Error handling query '{query}': {e}")
                return "An error occurred while processing your query."
            
            
if __name__ == "__main__":
    try:
       
        query = "هل يستطيع شخص اخر من عائلتي الوصول لصندوق الامانات تبعي؟"
        query_pipeline = QueryPipeline(index_dir="faiss_index", top_k=3) 
        response = query_pipeline.handleQuery(query)
        print(f"Response: {response}")
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
       
