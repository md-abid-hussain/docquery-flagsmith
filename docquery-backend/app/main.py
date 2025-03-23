from bson.objectid import ObjectId
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.agents.ingestion.agent import graph as ingestion_agent_graph
from app.agents.qa.agent import graph as qa_agent_graph
from app.agents.utils.database import client, delete_repository_documents

load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:8000",  # FastAPI development server
        # Add your production domains here
        "https://docquery-ten.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


sdk = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAgent(
            name="ingestion_agent",
            graph=ingestion_agent_graph,
            description="Ingestion Agent",
        ),
        LangGraphAgent(name="qa_agent", graph=qa_agent_graph, description="QA Agent"),
    ]
)

# Add the CopilotKit FastAPI endpoint
add_fastapi_endpoint(app, sdk, "/copilotkit")


@app.delete("/repositories/{repo_id}")
async def delete_repository(repo_id: str):
    try:
        # Get repository collection
        repository_collection = client["docquery"]["repositories"]

        # Convert string ID to MongoDB ObjectId
        try:
            object_id = ObjectId(repo_id)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid repository ID format: {str(e)}"
            )

        # Find repository by ID
        repo = repository_collection.find_one({"_id": object_id})

        if not repo:
            # Let's check if it's stored as a string instead of ObjectId
            repo = repository_collection.find_one({"_id": repo_id})

            if not repo:
                raise HTTPException(status_code=404, detail="Repository not found")

        # Get the repo name and call the delete function
        repo_name = repo.get("name")
        if not repo_name:
            raise HTTPException(status_code=404, detail="Repository name not found")

        # Call the delete function
        result = delete_repository_documents(repo_name)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete repository documents: {str(e)}"
        )


@app.get("/")
def health_check():
    return {"status": "ok"}
