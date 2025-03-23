from typing import Optional

from copilotkit.state import CopilotKitState


class QAAgentState(CopilotKitState):
    question: str
    repository_name: str
    branch: str
    context: Optional[str]
    error: Optional[str]
