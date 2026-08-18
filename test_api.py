import urllib.request
import json
import urllib.parse
import os

base = "http://localhost:8001"

# 1. Create plant
req = urllib.request.Request(f"{base}/plants/", method="POST", data=json.dumps({"name": "Test", "species": "Solanum lycopersicum"}).encode(), headers={"Content-Type": "application/json"})
plant_id = json.loads(urllib.request.urlopen(req).read())["id"]

# 2. Upload VCF (simplified form data)
import uuid
boundary = uuid.uuid4().hex
file_path = r"C:\Users\agraw\.gemini\antigravity\scratch\PhytoVaria_SIH\Phytovaria-Bioinformatics\data\vcf_samples\resistant_cultivar_SL4.vcf"
with open(file_path, "rb") as f:
    file_data = f.read()

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="resistant.vcf"\r\n'
    f"Content-Type: application/octet-stream\r\n\r\n".encode() + file_data + f"\r\n--{boundary}--\r\n".encode()
)
req = urllib.request.Request(f"{base}/plants/{plant_id}/vcf", method="POST", data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
urllib.request.urlopen(req)

# 3. Analyze
req = urllib.request.Request(f"{base}/plants/{plant_id}/analyze", method="POST")
urllib.request.urlopen(req)

# 4. Run Risk
req = urllib.request.Request(f"{base}/plants/{plant_id}/risk-assessment/run", method="POST")
urllib.request.urlopen(req)

# 5. Get Risk
req = urllib.request.Request(f"{base}/plants/{plant_id}/risk")
res = urllib.request.urlopen(req)
print(json.dumps(json.loads(res.read()), indent=2))
