from pydantic import BaseModel

class Cue(BaseModel):
    id: str
    name: str
    type: str  # 'color' or 'animation'
    value: str

class CreateCuePayload(BaseModel):
    name: str
    type: str
    value: str

class UpdateCuePayload(BaseModel):
    name: str
    type: str
    value: str