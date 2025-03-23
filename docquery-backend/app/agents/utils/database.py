import datetime
import os
from typing import List

from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient

from .models import get_embedding_model

client = MongoClient(os.environ.get("MONGODB_ATLAS_CLUSTER_URI"))
DB_NAME = "docquery_db"
COLLECTION_NAME = "vectorstore"
ATLAS_VECTOR_SEARCH_INDEX = "rag_index"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]

vector_store = MongoDBAtlasVectorSearch(
    collection=MONGODB_COLLECTION,
    embedding=get_embedding_model(),
    index_name=ATLAS_VECTOR_SEARCH_INDEX,
    relevance_score_fn="cosine",
)


def get_vector_store():
    return vector_store


def save_to_database(name: str, file_paths: List[str]):
    repository_collection = client["docquery"]["repositories"]
    repository_collection.insert_one({"name": name, "files": file_paths})


def save_user_repository(name: str, user_email: str, files_path: List[str] = None):
    """
    Add repository name to user's ingestedRepositories list
    
    Args:
        name: Repository name
        user_email: User's email address
        files_path: Not used in this simplified version
        
    Returns:
        dict: Status of the operation
    """
    try:
        # Get user collection
        user_db = client["docquery"]["User"]
        
        # Find user by email
        user = user_db.find_one({"email": user_email})
        
        if not user:
            return {
                "success": False,
                "message": f"User with email {user_email} not found"
            }
        
        # Update user's ingested repositories
        result = user_db.update_one(
            {"email": user_email},
            {
                "$addToSet": {"ingestedRepositories": name},
                "$set": {"updatedAt": datetime.datetime.utcnow()}
            }
        )
        
        return {
            "success": True,
            "message": "Repository added to user's profile",
            "modified": result.modified_count > 0
        }
    except Exception as e:
        print(f"Error updating user repository list: {str(e)}")
        return {"success": False, "message": str(e)}


def delete_repository_documents(repo_name: str):
    # Delete documents from vector store
    vectorstore_result = MONGODB_COLLECTION.delete_many({"repo": repo_name})

    # Delete repository entry
    repository_collection = client["docquery"]["repositories"]
    repo_result = repository_collection.delete_one({"name": repo_name})

    return {
        "success": True,
        "deleted_documents": vectorstore_result.deleted_count,
        "deleted_repository": repo_result.deleted_count > 0,
    }
