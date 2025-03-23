import os

from copilotkit.langchain import copilotkit_emit_state
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import GithubFileLoader
from langchain_core.documents import Document
from langchain_core.runnables import RunnableConfig

from app.agents.utils.database import (delete_repository_documents,
                                       get_vector_store, save_to_database,
                                       save_user_repository)

from .state import IngestionAgentState


def create_github_file_loader(repo, branch):
    return GithubFileLoader(
        repo=repo,
        access_token=os.environ.get("GITHUB_PERSONAL_ACCESS_TOKEN"),
        file_filter=None,
        branch=branch,
    )


async def ingestion_node(state: IngestionAgentState, config: RunnableConfig):
    try:
        vector_store = get_vector_store()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=200
        )
        loader = create_github_file_loader(
            state["repo"]["full_name"], state["repo"]["branch"]
        )

        for index, file_path in enumerate(state["repo"]["files_path"]):
            state["files_ingested"] = index + 1
            await copilotkit_emit_state(config, state)

            document_content = loader.get_file_content_by_path(file_path)
            document = Document(
                page_content=document_content,
                metadata={"file_path": file_path, "repo": state["repo"]["full_name"]},
            )

            split_docs = text_splitter.split_documents([document])
            vector_store.add_documents(split_docs)
        return state
    except Exception as e:
        state["error"] = f"Error during ingestion: {str(e)}"
        return state


async def verify_ingestion_node(state: IngestionAgentState, config: RunnableConfig):
    if state["error"]:
        state["status"] = "FAILED"
        delete_repository_documents(state["repo"]["full_name"])
    else:
        if state["repo"].get("user_email"):
            save_user_repository(
                state["repo"]["full_name"],
                state["repo"]["user_email"],
                state["repo"]["files_path"],
            )
        else:
            save_to_database(state["repo"]["full_name"], state["repo"]["files_path"])
        state["status"] = "COMPLETED"

    return state
