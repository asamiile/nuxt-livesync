from pydantic import BaseModel

class LoginPayload(BaseModel):
    password: str
