# AI Learning Platform Glossary

A comprehensive guide to key terms and concepts in artificial intelligence and machine learning.

## A

### Activation Function
A mathematical function applied to the output of a neural network layer to introduce non-linearity. Common examples include ReLU, sigmoid, and tanh.

### Attention Mechanism
A technique that allows models to focus on specific parts of the input when making predictions. Think of it like highlighting relevant information while reading.

### Autoregressive Model
A model that predicts the next element in a sequence based on previous elements. GPT models are autoregressive language models.

## B

### BERT (Bidirectional Encoder Representations from Transformers)
A transformer model that reads text bidirectionally (left-to-right and right-to-left) to better understand context.

### Backpropagation
The algorithm used to train neural networks by calculating gradients and updating weights to minimize loss.

### Batch Size
The number of training examples processed together before updating model parameters.

## C

### Contextual Embeddings
Word representations that change based on the surrounding context, unlike static word embeddings. BERT and GPT use contextual embeddings.

### Cross-Attention
An attention mechanism where queries come from one sequence and keys/values come from another. Used in encoder-decoder models.

### CUDA
NVIDIA's parallel computing platform that enables GPUs to accelerate neural network training and inference.

## D

### Decoder
The part of a transformer model that generates output sequences. GPT models are decoder-only architectures.

### Dimensionality
The number of features or dimensions in a data representation. Word embeddings typically have 100-1000 dimensions.

### Dropout
A regularization technique that randomly sets some neurons to zero during training to prevent overfitting.

## E

### Embedding
A dense vector representation of discrete objects (like words or images) in a continuous space where similar items are close together.

### Encoder
The part of a transformer model that processes and understands input sequences. BERT is an encoder-only architecture.

### Epoch
One complete pass through the entire training dataset during model training.

### Emergent Abilities
Capabilities that arise in large language models that weren't explicitly programmed, such as mathematical reasoning or code generation.

## F

### Fine-tuning
The process of adapting a pre-trained model to a specific task by training on task-specific data.

### Forward Pass
The process of passing input data through a neural network to generate output predictions.

### Foundation Model
A large-scale model trained on broad data that can be adapted for various downstream tasks.

## G

### GPT (Generative Pre-trained Transformer)
A family of autoregressive language models that generate text by predicting the next word in a sequence.

### Gradient Descent
An optimization algorithm that iteratively adjusts model parameters to minimize the loss function.

### Ground Truth
The correct or true answer used to evaluate model predictions during training and testing.

## H

### Hallucination
When a language model generates false or nonsensical information that sounds plausible but is factually incorrect.

### Hidden Layer
An intermediate layer in a neural network between the input and output layers where computations occur.

### Hyperparameter
Configuration settings for model training (like learning rate or batch size) that are set before training begins.

## I

### Inference
The process of using a trained model to make predictions on new, unseen data.

### In-Context Learning
The ability of large language models to learn new tasks from examples provided in the input prompt without parameter updates.

### Instruction Tuning
Training a model to follow natural language instructions by providing examples of instruction-following behavior.

## K

### Knowledge Distillation
A technique for training a smaller "student" model to mimic the behavior of a larger "teacher" model.

## L

### Language Model
A statistical model that predicts the probability of sequences of words or tokens in a language.

### Learning Rate
A hyperparameter that controls how much model parameters are updated during each training step.

### Loss Function
A function that measures the difference between predicted and actual outputs, used to guide model training.

### LLM (Large Language Model)
A neural language model with billions or trillions of parameters trained on massive text datasets.

## M

### Masked Language Modeling
A training technique where some tokens are hidden and the model learns to predict them based on surrounding context.

### Multi-Head Attention
An attention mechanism that uses multiple attention "heads" to focus on different aspects of the input simultaneously.

### Model Architecture
The structural design of a neural network, defining how layers are connected and organized.

## N

### Neural Network
A computational model inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information.

### N-gram
A contiguous sequence of n words from a text. Used in traditional language models before neural approaches.

### Next Token Prediction
The task of predicting the next word or token in a sequence, fundamental to autoregressive language models.

## O

### Overfitting
When a model learns the training data too well and performs poorly on new, unseen data.

### Optimization
The process of adjusting model parameters to minimize the loss function and improve performance.

## P

### Parameter
A learnable weight or bias in a neural network that gets adjusted during training.

### Perplexity
A metric used to evaluate language models, measuring how well the model predicts a text sequence.

### Positional Encoding
A technique to provide information about token positions to transformer models, which don't inherently understand sequence order.

### Pre-training
The initial phase of training a model on a large, general dataset before fine-tuning on specific tasks.

### Prompt Engineering
The practice of crafting input prompts to guide language models toward desired outputs.

## Q

### Query, Key, Value (QKV)
The three components used in attention mechanisms to determine what information to focus on.

### Quantization
A technique to reduce model size and computational requirements by using lower-precision numbers.

## R

### ReLU (Rectified Linear Unit)
An activation function that outputs the input if positive, otherwise zero. Commonly used in neural networks.

### Reinforcement Learning from Human Feedback (RLHF)
A training technique that uses human preferences to improve model behavior and alignment.

### Residual Connection
A connection that adds the input to the output of a layer, helping information flow through deep networks.

### Reward Model
A model trained to predict human preferences, used in RLHF to provide feedback for policy optimization.

## S

### Self-Attention
An attention mechanism where queries, keys, and values all come from the same input sequence.

### Softmax
A function that converts a vector of numbers into a probability distribution where all values sum to 1.

### Supervised Fine-tuning (SFT)
Training a pre-trained model on labeled examples of desired input-output behavior.

### Scaling Laws
Empirical relationships describing how model performance improves with increased model size, data, or compute.

## T

### Token
The basic unit of text processing in language models, which can be words, subwords, or characters.

### Tokenization
The process of converting text into tokens that can be processed by language models.

### Transfer Learning
Using knowledge gained from one task to improve performance on a related task.

### Transformer
A neural network architecture that uses attention mechanisms and has become the foundation for modern language models.

### Temperature
A parameter that controls the randomness of text generation - higher values make output more random, lower values more deterministic.

### Top-k Sampling
A text generation strategy that selects the next token from the k most likely candidates.

## U

### Underfitting
When a model is too simple to capture the underlying patterns in the data, resulting in poor performance.

### Unsupervised Learning
Learning patterns from data without explicit labels or correct answers.

## V

### Vector
A mathematical object with magnitude and direction, used to represent embeddings in multi-dimensional space.

### Vocabulary
The set of all unique tokens that a model can understand and generate.

## W

### Weight
A parameter in a neural network that determines the strength of connections between neurons.

### Word2Vec
An early neural approach to creating word embeddings by predicting words from their context.

## Z

### Zero-shot Learning
The ability of a model to perform tasks it wasn't explicitly trained on, using only its pre-trained knowledge.

---

## Advanced Topics & Production Concepts

### Agent Framework
A software platform that provides tools and patterns for building AI agents. Examples include LangChain, LlamaIndex, and CrewAI.

### Attention Optimization
Techniques to reduce the computational complexity of attention mechanisms, including sparse attention and attention approximations.

### AWQ (Activation-aware Weight Quantization)
A post-training quantization method that preserves important weights while compressing others to reduce model size.

### Batch Inference
Processing multiple requests simultaneously to improve throughput in production serving systems.

### Chain-of-Thought (CoT)
A prompting technique that encourages models to show step-by-step reasoning before arriving at an answer.

### CrewAI
A framework for building and managing teams of AI agents that can collaborate on complex tasks.

### Dynamic Batching
A serving optimization that groups incoming requests of different sizes into efficient batches for processing.

### Function Calling
The ability of language models to invoke external functions or APIs based on natural language instructions.

### GGUF (GPT-Generated Unified Format)
A file format for storing large language models optimized for inference, especially on consumer hardware.

### GPTQ (GPT Quantization)
A post-training quantization method specifically designed for transformer-based language models.

### INT4/INT8 Inference
Running models using 4-bit or 8-bit integer representations instead of full-precision floating-point numbers.

### KV-Cache
A memory optimization technique that stores key and value tensors from previous tokens to speed up autoregressive generation.

### LangChain
A popular framework for developing applications powered by language models, providing tools for chaining operations.

### LlamaIndex
A data framework for connecting custom data sources to large language models, especially for RAG applications.

### Llama (Large Language Model Meta AI)
Meta's family of open-source foundation models known for their efficiency and strong performance.

### Load Balancing
Distributing incoming requests across multiple model instances or servers to optimize resource utilization.

### MCP (Model Context Protocol)
A standardized protocol for language models to interact with external tools and services.

### Memory Management
Techniques for efficiently using GPU memory during model inference, including memory pooling and garbage collection.

### Mistral
A family of efficient open-source language models known for their strong performance relative to size.

### Mixture of Experts (MoE)
An architecture that uses multiple specialized sub-networks (experts) and learns to route inputs to the most relevant experts.

### Model Parallelism
Distributing a single large model across multiple GPUs or machines to handle models larger than single-device memory.

### Multi-Agent System
A system where multiple AI agents collaborate, communicate, or compete to accomplish complex tasks.

### Post-Training Quantization
Compressing a trained model by reducing the precision of weights without additional training.

### Production Serving
The infrastructure and practices for deploying machine learning models in real-world applications at scale.

### Quantization-Aware Training
Training models with simulated quantization effects to maintain accuracy when deployed with reduced precision.

### RAG (Retrieval-Augmented Generation)
A technique that combines language models with information retrieval to generate responses based on external knowledge.

### ReAct (Reasoning and Acting)
A framework that enables language models to interleave reasoning and action-taking for complex problem solving.

### RoPE (Rotary Position Embedding)
A method for encoding positional information in transformers that enables better handling of longer sequences.

### Sparse Attention
Attention mechanisms that focus on a subset of input positions rather than all positions, reducing computational cost.

### Tensor Parallelism
A technique for distributing the computation of individual operations across multiple devices.

### TensorRT-LLM
NVIDIA's optimized runtime for large language model inference on GPU hardware.

### Throughput Optimization
Techniques to maximize the number of requests processed per unit time in production systems.

### Tool Integration
The ability of AI systems to use external tools, APIs, or services to accomplish tasks beyond their training.

### vLLM
An open-source library for fast LLM inference and serving, optimized for high throughput scenarios.

### Weight Sharing
A technique where multiple parts of a model use the same parameters, reducing memory requirements and training data needs.

---

## Related Concepts

### Mathematical Foundations
- **Linear Algebra**: Vectors, matrices, and operations fundamental to neural networks
- **Probability Theory**: Statistical foundations for understanding model predictions
- **Calculus**: Derivatives and gradients used in training algorithms

### Evaluation Metrics
- **BLEU Score**: Measures quality of machine translation
- **ROUGE Score**: Evaluates text summarization quality
- **F1 Score**: Balances precision and recall for classification tasks

### Hardware & Infrastructure
- **GPU Computing**: Graphics cards optimized for parallel neural network computations
- **Distributed Training**: Spreading model training across multiple machines
- **Model Serving**: Infrastructure for deploying models in production

---

*This glossary is a living document that evolves with the field. Terms are explained at different levels of technical depth to support learners at various stages.*