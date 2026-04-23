# Backend
### setup :

- access venv -> 

**Windows**
```venv/bin/activate.fish ``` 
(oder welche shell ihr benutzt )

**MacOS/Linux**
```source venv/bin/activate.fish ``` 
(oder welche shell ihr benutzt )

- download dependecies -> ```pip install -r requirements.txt```

- in terminal ```ollama run gemma4```

- in terminal :
```
mkdir -p models
cd models

# Download der ONNX Datei
curl -L https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx?download=true -o de_DE-thorsten-high.onnx

# Download der JSON Datei
curl -L https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json?download=true -o de_DE-thorsten-high.onnx.json
``` 
