import sagemaker
import boto3
from sagemaker.huggingface.model import HuggingFaceModel

def main():
    print("Starting deployment...")

    try:
        role = sagemaker.get_execution_role()
    except ValueError:
        iam = boto3.client('sagemaker')
        role = iam.get_role(RoleName='sagemaker_execution_role')['Role']['Arn']

    print(f"sagemaker role arn: {role}")
    

    # Hub model configuration <https://huggingface.co/models>
    hub = {
        'HF_MODEL_ID':'facebook/bart-large-cnn', # model_id from hf.co/models
        'HF_TASK':'summarization'                           # NLP task you want to use for predictions
    }

    role = os.environ.get("SAGEMAKER_ROLE")

    # create Hugging Face Model Class
    huggingface_model = HuggingFaceModel(
    env=hub,                                   
    role=role,                                 
    transformers_version="4.26",
    pytorch_version="1.13",
    py_version='py39',
    )

    # deploy model to SageMaker Inference
    predictor = huggingface_model.deploy(
    initial_instance_count=1,
    instance_type="ml.t2.medium"
    )

    # example request: you always need to define "inputs"
    data = {
    "inputs": {
        "text": "Hello, world!"
        }
    }

    # request
    prediction = predictor.predict(data)
    print(prediction)
    predictor.delete_endpoint()

if __name__ == "__main__":
    main()
