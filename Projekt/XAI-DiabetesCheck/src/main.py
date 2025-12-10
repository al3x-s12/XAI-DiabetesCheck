from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS erlauben, damit React-Frontend zugreifen kann
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Dev-Server
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from Python Backend!"}
