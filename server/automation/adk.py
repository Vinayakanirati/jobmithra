def tool(func):
    """
    Mock @tool decorator for JobMithra ADK
    """
    func._is_adk_tool = True
    return func

class Agent:
    def __init__(self, name, instructions, tools):
        self.name = name
        self.instructions = instructions
        self.tools = tools

    def run(self, tool_func, **kwargs):
        return tool_func(**kwargs)
