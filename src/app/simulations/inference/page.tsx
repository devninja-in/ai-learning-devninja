'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Play, Pause, Zap, BarChart3, Activity, Cpu, HardDrive,
  TrendingUp, Clock, Users, ArrowRight, ChevronDown,
  Settings, Monitor, Database, Layers, GitBranch,
  Gauge, Target, AlertCircle, CheckCircle, Timer,
  BookOpen
} from 'lucide-react'

// Inference optimization topics
const INFERENCE_TOPICS = [
  {
    id: 'prefill-decode',
    name: 'Prefill vs Decode',
    shortName: 'Prefill/Decode',
    description: 'Understanding the two phases of LLM inference',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    icon: Zap,
    explanation: 'LLM inference has two distinct phases: prefill (parallel processing of input tokens) and decode (sequential generation of output tokens). Each phase has different computational characteristics and optimization opportunities.',
    keyPoints: [
      'Prefill: Parallel processing, compute-bound, batch-friendly',
      'Decode: Sequential generation, memory-bound, latency-critical',
      'Different optimization strategies for each phase',
      'KV-cache management is crucial for decode performance'
    ]
  },
  {
    id: 'batching',
    name: 'Batching Strategies',
    shortName: 'Batching',
    description: 'Static, dynamic, and continuous batching approaches',
    color: 'bg-green-100 text-green-800 border-green-200',
    gradient: 'from-green-500 to-green-600',
    icon: Users,
    explanation: 'Different batching strategies trade off between latency and throughput. Static batching waits for full batches, dynamic batching adapts to request patterns, and continuous batching optimizes resource utilization.',
    keyPoints: [
      'Static: Simple but can waste resources waiting',
      'Dynamic: Better resource utilization, more complex',
      'Continuous: Optimal throughput with complex scheduling',
      'Request padding and KV-cache management challenges'
    ]
  },
  {
    id: 'vllm-paged',
    name: 'vLLM & PagedAttention',
    shortName: 'vLLM',
    description: 'Memory-efficient attention computation and KV-cache management',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    icon: HardDrive,
    explanation: 'vLLM introduces PagedAttention, which manages KV-cache memory like virtual memory in operating systems, enabling efficient memory utilization and dynamic batching.',
    keyPoints: [
      'PagedAttention: Virtual memory for KV-cache',
      'Eliminates memory fragmentation and waste',
      'Enables near-optimal memory utilization',
      'Supports dynamic sequence lengths efficiently'
    ]
  },
  {
    id: 'speculative',
    name: 'Speculative Decoding',
    shortName: 'Speculative',
    description: 'Accelerating inference with draft models',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    icon: Target,
    explanation: 'Speculative decoding uses a smaller, faster draft model to predict multiple tokens ahead, then verifies them with the main model in parallel, achieving significant speedup.',
    keyPoints: [
      'Draft model generates multiple token candidates',
      'Main model verifies candidates in parallel',
      '2-3x speedup with minimal quality loss',
      'Works best when draft model aligns well with target'
    ]
  },
  {
    id: 'parallelism',
    name: 'Parallelism Techniques',
    shortName: 'Parallelism',
    description: 'Model, tensor, and pipeline parallelism strategies',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600',
    icon: GitBranch,
    explanation: 'Large models require various parallelism strategies to fit in memory and achieve good performance across multiple GPUs and nodes.',
    keyPoints: [
      'Model Parallelism: Split model across devices',
      'Tensor Parallelism: Split individual operations',
      'Pipeline Parallelism: Different layers on different devices',
      'Communication overhead vs computation overlap'
    ]
  },
  {
    id: 'optimization',
    name: 'Runtime Optimization',
    shortName: 'Optimization',
    description: 'TensorRT-LLM, ONNX, and hardware acceleration',
    color: 'bg-red-100 text-red-800 border-red-200',
    gradient: 'from-red-500 to-red-600',
    icon: Gauge,
    explanation: 'Runtime optimization frameworks like TensorRT-LLM and ONNX provide kernel fusion, operator optimization, and hardware-specific acceleration for production deployment.',
    keyPoints: [
      'Kernel fusion reduces memory bandwidth bottlenecks',
      'Operator optimization for specific hardware',
      'Mixed precision and quantization integration',
      'Graph optimization and constant folding'
    ]
  }
]

// Sample inference metrics
interface InferenceMetrics {
  latency: number
  throughput: number
  memoryUsage: number
  gpuUtilization: number
  costPerToken: number
  batchSize: number
  sequenceLength: number
}

// Simulation data
const BATCH_STRATEGIES = {
  static: {
    name: 'Static Batching',
    waitTime: 200,
    throughput: 0.7,
    latency: 1.3,
    description: 'Waits for full batch before processing'
  },
  dynamic: {
    name: 'Dynamic Batching',
    waitTime: 50,
    throughput: 0.9,
    latency: 0.9,
    description: 'Adapts batch size based on request patterns'
  },
  continuous: {
    name: 'Continuous Batching',
    waitTime: 10,
    throughput: 1.0,
    latency: 0.8,
    description: 'Continuously processes requests as they arrive'
  }
}

const PARALLELISM_CONFIGS = [
  {
    name: 'Model Parallelism',
    devices: 4,
    efficiency: 0.85,
    memory: 0.7,
    description: 'Split model layers across devices'
  },
  {
    name: 'Tensor Parallelism',
    devices: 8,
    efficiency: 0.92,
    memory: 0.5,
    description: 'Split tensors within layers'
  },
  {
    name: 'Pipeline Parallelism',
    devices: 6,
    efficiency: 0.88,
    memory: 0.6,
    description: 'Different pipeline stages on different devices'
  }
]

// Key Concepts for comprehensive inference education
const INFERENCE_KEY_CONCEPTS = {
  'fundamentals': {
    title: 'Inference Fundamentals',
    icon: Cpu,
    summary: 'Core concepts of LLM inference, including prefill/decode phases and KV-cache management',
    concepts: [
      {
        term: 'Prefill Phase',
        definition: 'The parallel processing phase where input tokens are processed simultaneously to populate the KV-cache.',
        details: 'During prefill, the model processes all input tokens in parallel, making it compute-bound and highly parallelizable. This phase scales well with batch size and benefits from high compute throughput.',
        examples: [
          'Processing a 2048-token prompt in ~50ms',
          'Batch processing multiple prompts simultaneously',
          'Utilizing full GPU compute for parallel attention'
        ],
        implementation: `# Prefill phase optimization
def optimize_prefill(batch_prompts):
    # Pad sequences to same length for efficient batching
    padded_batch = pad_sequences(batch_prompts)

    # Process entire batch in parallel
    with torch.cuda.stream():
        attention_output = parallel_attention(padded_batch)
        kv_cache = populate_cache(attention_output)

    return kv_cache`
      },
      {
        term: 'Decode Phase',
        definition: 'The sequential token generation phase where the model generates output tokens one at a time.',
        details: 'Decode is memory-bound and sequential by nature. Each new token requires attention computation with all previous tokens in the KV-cache, making memory bandwidth the primary bottleneck.',
        examples: [
          'Generating 512 tokens sequentially at ~15ms per token',
          'Memory bandwidth becomes the limiting factor',
          'KV-cache size grows linearly with sequence length'
        ],
        implementation: `# Decode phase optimization
def optimize_decode(kv_cache, max_tokens=512):
    generated_tokens = []

    for step in range(max_tokens):
        # Memory-bound: read entire KV-cache
        next_token_logits = compute_attention_with_cache(
            kv_cache, current_position=step
        )

        token = sample_token(next_token_logits)
        generated_tokens.append(token)

        # Update KV-cache for next iteration
        kv_cache = update_cache(kv_cache, token, step)

        if token == EOS_TOKEN:
            break

    return generated_tokens`
      }
    ]
  },
  'batching-strategies': {
    title: 'Batching Strategies',
    icon: Users,
    summary: 'Static, dynamic, and continuous batching approaches for optimizing throughput and latency',
    concepts: [
      {
        term: 'Static Batching',
        definition: 'Traditional batching that waits for a fixed batch size before processing requests.',
        details: 'Simple but inefficient approach that can lead to high latency when requests arrive sporadically. All sequences in a batch must be processed to completion before the next batch can begin.',
        examples: [
          'Wait for 32 requests before starting inference',
          'Pad all sequences to maximum length in batch',
          'Simple implementation but poor resource utilization'
        ],
        implementation: `# Static batching implementation
class StaticBatcher:
    def __init__(self, batch_size=32, max_wait_time=1.0):
        self.batch_size = batch_size
        self.max_wait_time = max_wait_time
        self.request_queue = []

    async def process_requests(self):
        while True:
            # Wait for full batch or timeout
            if len(self.request_queue) >= self.batch_size:
                batch = self.request_queue[:self.batch_size]
                self.request_queue = self.request_queue[self.batch_size:]

                # Process entire batch to completion
                results = await self.inference_engine.generate(batch)
                await self.send_responses(results)
            else:
                await asyncio.sleep(0.01)  # Wait for more requests`
      },
      {
        term: 'Dynamic Batching',
        definition: 'Adaptive batching that adjusts batch size based on request patterns and system load.',
        details: 'More sophisticated approach that balances latency and throughput by dynamically adjusting batch sizes based on queue depth, system load, and sequence length distribution.',
        examples: [
          'Adjust batch size from 1-64 based on queue depth',
          'Group requests by similar sequence lengths',
          'Balance latency vs throughput automatically'
        ],
        implementation: `
# Dynamic batching with adaptive sizing
class DynamicBatcher:
    def __init__(self, min_batch=1, max_batch=64):
        self.min_batch = min_batch
        self.max_batch = max_batch
        self.request_queue = []
        self.load_tracker = LoadTracker()

    def calculate_optimal_batch_size(self):
        queue_depth = len(self.request_queue)
        system_load = self.load_tracker.current_load()

        # Adaptive batch sizing algorithm
        if system_load < 0.5 and queue_depth > 16:
            return min(self.max_batch, queue_depth)
        elif queue_depth < 4:
            return max(self.min_batch, queue_depth)
        else:
            return min(16, queue_depth)

    async def process_batch(self):
        batch_size = self.calculate_optimal_batch_size()
        if self.request_queue and batch_size > 0:
            batch = self.request_queue[:batch_size]
            self.request_queue = self.request_queue[batch_size:]
            return await self.inference_engine.generate(batch)`
      },
      {
        term: 'Continuous Batching',
        definition: 'Advanced batching that processes requests as they complete, maintaining optimal GPU utilization.',
        details: 'State-of-the-art approach where completed requests are immediately replaced with new ones, eliminating idle time and maximizing throughput while maintaining low latency.',
        examples: [
          'Replace completed sequences immediately',
          'Maintain constant GPU utilization',
          'Optimal balance of latency and throughput'
        ],
        implementation: `
# Continuous batching implementation
class ContinuousBatcher:
    def __init__(self, max_batch_size=32):
        self.max_batch_size = max_batch_size
        self.active_requests = {}  # request_id -> request_state
        self.request_queue = asyncio.Queue()

    async def continuous_inference_loop(self):
        while True:
            # Fill batch with active requests + new requests
            batch = []

            # Add continuing requests
            for req_id, state in self.active_requests.items():
                if not state.completed:
                    batch.append((req_id, state))

            # Add new requests to fill batch
            while len(batch) < self.max_batch_size and not self.request_queue.empty():
                new_request = await self.request_queue.get()
                req_id = new_request.id
                self.active_requests[req_id] = RequestState(new_request)
                batch.append((req_id, self.active_requests[req_id]))

            if batch:
                # Process one iteration for all requests in batch
                results = await self.inference_engine.step(batch)

                # Update states and send completed responses
                for req_id, result in results.items():
                    if result.completed:
                        await self.send_response(req_id, result)
                        del self.active_requests[req_id]
                    else:
                        self.active_requests[req_id].update(result)

            await asyncio.sleep(0)  # Yield control`
      }
    ]
  },
  'memory-optimization': {
    title: 'Memory Optimization',
    icon: HardDrive,
    summary: 'vLLM PagedAttention, quantization, and efficient KV-cache management techniques',
    concepts: [
      {
        term: 'KV-Cache Management',
        definition: 'Efficient storage and retrieval of key-value pairs from attention computation to avoid recomputation.',
        details: 'The KV-cache stores computed keys and values for all previous tokens, enabling efficient generation but consuming significant memory. Proper management is crucial for serving large models.',
        examples: [
          'Store 2048 tokens × 4096 hidden size × 32 layers = ~1GB per sequence',
          'Memory usage grows linearly with sequence length',
          'Cache eviction strategies for long sequences'
        ],
        implementation: `
# Efficient KV-cache implementation
class KVCache:
    def __init__(self, max_batch_size, max_seq_len, hidden_size, num_layers):
        self.max_batch_size = max_batch_size
        self.max_seq_len = max_seq_len

        # Pre-allocate cache tensors
        self.key_cache = torch.zeros(
            (num_layers, max_batch_size, max_seq_len, hidden_size),
            dtype=torch.float16, device='cuda'
        )
        self.value_cache = torch.zeros_like(self.key_cache)
        self.sequence_lengths = torch.zeros(max_batch_size, dtype=torch.int32)

    def update(self, layer_idx, batch_idx, position, keys, values):
        self.key_cache[layer_idx, batch_idx, position] = keys
        self.value_cache[layer_idx, batch_idx, position] = values
        self.sequence_lengths[batch_idx] = position + 1

    def get_kv_for_attention(self, layer_idx, batch_idx):
        seq_len = self.sequence_lengths[batch_idx]
        return (
            self.key_cache[layer_idx, batch_idx, :seq_len],
            self.value_cache[layer_idx, batch_idx, :seq_len]
        )
        `
      },
      {
        term: 'PagedAttention',
        definition: 'Memory management technique that stores KV-cache in non-contiguous memory blocks, similar to virtual memory.',
        details: 'Inspired by operating system virtual memory, PagedAttention allocates KV-cache in fixed-size blocks (pages) that can be non-contiguous, eliminating memory fragmentation and enabling efficient dynamic batching.',
        examples: [
          '4KB pages for KV-cache allocation',
          '90%+ memory utilization vs 60-70% traditional',
          'Dynamic sequence length support without waste'
        ],
        implementation: `
# PagedAttention implementation
class PagedKVCache:
    def __init__(self, page_size=4096, max_pages=10000):
        self.page_size = page_size  # tokens per page
        self.max_pages = max_pages

        # Physical memory pool
        self.physical_pages = torch.zeros(
            (max_pages, page_size, hidden_size),
            dtype=torch.float16, device='cuda'
        )
        self.free_pages = list(range(max_pages))

        # Virtual to physical page mapping
        self.page_tables = {}  # sequence_id -> [physical_page_ids]

    def allocate_sequence(self, sequence_id, estimated_length):
        pages_needed = math.ceil(estimated_length / self.page_size)
        allocated_pages = []

        for _ in range(pages_needed):
            if self.free_pages:
                physical_page = self.free_pages.pop()
                allocated_pages.append(physical_page)
            else:
                raise OutOfMemoryError(No free pages available)

        self.page_tables[sequence_id] = allocated_pages
        return allocated_pages

    def write_kv(self, sequence_id, position, keys, values):
        page_idx = position // self.page_size
        offset = position % self.page_size

        physical_page = self.page_tables[sequence_id][page_idx]
        self.physical_pages[physical_page, offset] = keys  # Simplified

    def read_kv_sequence(self, sequence_id, length):
        pages = self.page_tables[sequence_id]
        kv_sequence = []

        for i, physical_page in enumerate(pages):
            start_pos = i * self.page_size
            end_pos = min(start_pos + self.page_size, length)
            if start_pos < length:
                kv_sequence.append(
                    self.physical_pages[physical_page, :end_pos-start_pos]
                )

        return torch.cat(kv_sequence, dim=0)
        `
      }
    ]
  },
  'acceleration-techniques': {
    title: 'Acceleration Techniques',
    icon: Zap,
    summary: 'Speculative decoding, tensor parallelism, and kernel fusion for performance gains',
    concepts: [
      {
        term: 'Speculative Decoding',
        definition: 'Acceleration technique that uses a smaller draft model to predict multiple tokens ahead, then verifies them in parallel.',
        details: 'Speculative decoding achieves significant speedup by having a fast draft model generate multiple token candidates, which are then verified by the target model in parallel, accepting correct predictions.',
        examples: [
          'Draft model generates 4-8 tokens in 5ms',
          'Target model verifies all tokens in 20ms vs 120ms sequential',
          '2-3x speedup with 80-90% acceptance rate'
        ],
        implementation: `
# Speculative decoding implementation
class SpeculativeDecoder:
    def __init__(self, draft_model, target_model, lookahead_tokens=4):
        self.draft_model = draft_model
        self.target_model = target_model
        self.lookahead_tokens = lookahead_tokens

    async def generate_with_speculation(self, prompt, max_tokens=512):
        generated_tokens = []
        current_sequence = prompt

        while len(generated_tokens) < max_tokens:
            # Draft model generates multiple candidates
            draft_candidates = await self.draft_model.generate(
                current_sequence,
                max_new_tokens=self.lookahead_tokens,
                temperature=0.8
            )

            # Target model verifies candidates in parallel
            candidate_sequence = current_sequence + draft_candidates
            target_logits = await self.target_model.forward(candidate_sequence)

            # Accept/reject candidates based on probability threshold
            accepted_tokens = []
            for i, candidate in enumerate(draft_candidates):
                target_prob = torch.softmax(target_logits[len(current_sequence) + i], dim=-1)
                draft_prob = torch.softmax(draft_model.get_logits()[i], dim=-1)

                acceptance_prob = min(1.0, target_prob[candidate] / draft_prob[candidate])

                if torch.rand(1) < acceptance_prob:
                    accepted_tokens.append(candidate)
                else:
                    # Sample from adjusted distribution and stop
                    adjusted_probs = torch.clamp(target_prob - draft_prob, min="0")
                    adjusted_probs = adjusted_probs / adjusted_probs.sum()
                    new_token = torch.multinomial(adjusted_probs, 1)[0]
                    accepted_tokens.append(new_token)
                    break

            generated_tokens.extend(accepted_tokens)
            current_sequence.extend(accepted_tokens)

            if not accepted_tokens or accepted_tokens[-1] == EOS_TOKEN:
                break

        return generated_tokens
        `
      },
      {
        term: 'Tensor Parallelism',
        definition: 'Parallelization technique that splits individual tensor operations across multiple devices.',
        details: 'Tensor parallelism divides large tensors (like attention weights) across multiple GPUs, enabling larger models to fit in memory while maintaining computational efficiency through parallel execution.',
        examples: [
          'Split 12,288 attention heads across 8 GPUs (1,536 each)',
          'All-reduce communication for gradient synchronization',
          'Linear scaling with communication overhead'
        ],
        implementation: `
# Tensor parallelism for attention layers
class TensorParallelAttention:
    def __init__(self, hidden_size, num_heads, world_size, rank):
        self.hidden_size = hidden_size
        self.num_heads = num_heads
        self.world_size = world_size
        self.rank = rank

        # Partition attention heads across GPUs
        self.heads_per_partition = num_heads // world_size
        self.head_start = rank * self.heads_per_partition
        self.head_end = (rank + 1) * self.heads_per_partition

        # Local weight matrices (partitioned)
        self.query_weight = nn.Linear(
            hidden_size,
            self.heads_per_partition * head_dim
        )
        self.key_weight = nn.Linear(
            hidden_size,
            self.heads_per_partition * head_dim
        )
        self.value_weight = nn.Linear(
            hidden_size,
            self.heads_per_partition * head_dim
        )

        # Output projection (row-parallel)
        self.output_weight = nn.Linear(
            self.heads_per_partition * head_dim,
            hidden_size
        )

    def forward(self, hidden_states):
        # Each GPU computes its subset of attention heads
        local_q = self.query_weight(hidden_states)
        local_k = self.key_weight(hidden_states)
        local_v = self.value_weight(hidden_states)

        # Compute local attention
        local_attention = scaled_dot_product_attention(
            local_q, local_k, local_v
        )

        # Local output projection
        local_output = self.output_weight(local_attention)

        # All-reduce across GPUs to get final result
        final_output = torch.distributed.all_reduce(
            local_output,
            op=torch.distributed.ReduceOp.SUM
        )

        return final_output
        `
      },
      {
        term: 'Kernel Fusion',
        definition: 'Optimization technique that combines multiple operations into single GPU kernels to reduce memory bandwidth requirements.',
        details: 'Kernel fusion eliminates intermediate memory reads/writes by combining operations like attention, normalization, and activation functions into optimized kernels, significantly reducing memory bandwidth bottlenecks.',
        examples: [
          'Fuse attention + LayerNorm + GeLU into single kernel',
          'Reduce memory bandwidth by 60-80%',
          'Custom CUDA kernels for specific operation patterns'
        ],
        implementation: `
# Fused attention kernel concept
import triton
import triton.language as tl

@triton.jit
def fused_attention_kernel(
    Q, K, V, Out,
    seq_len, head_dim,
    BLOCK_SIZE: tl.constexpr
):
    # Fused scaled dot-product attention with optimizations
    row_idx = tl.program_id(0)

    # Load Q for current row
    q_offset = row_idx * head_dim + tl.arange(0, BLOCK_SIZE)
    q = tl.load(Q + q_offset, mask=q_offset < head_dim)

    # Initialize attention computation
    max_val = float('-inf')
    sum_exp = 0.0
    output = tl.zeros([BLOCK_SIZE], dtype=tl.float32)

    # Attention computation loop (fused softmax + matmul)
    for k_idx in range(0, seq_len, BLOCK_SIZE):
        k_offset = k_idx * head_dim + tl.arange(0, BLOCK_SIZE)
        k = tl.load(K + k_offset, mask=k_offset < head_dim)

        # Compute attention score
        score = tl.sum(q * k) / math.sqrt(head_dim)

        # Online softmax computation
        new_max = tl.maximum(max_val, score)
        exp_score = tl.exp(score - new_max)
        sum_exp = sum_exp * tl.exp(max_val - new_max) + exp_score
        max_val = new_max

        # Accumulate weighted values
        v_offset = k_idx * head_dim + tl.arange(0, BLOCK_SIZE)
        v = tl.load(V + v_offset, mask=v_offset < head_dim)
        output = output + exp_score * v

    # Final normalization and store
    output = output / sum_exp
    out_offset = row_idx * head_dim + tl.arange(0, BLOCK_SIZE)
    tl.store(Out + out_offset, output, mask=out_offset < head_dim)

# Usage in PyTorch
def fused_attention(q, k, v):
    seq_len, head_dim = q.shape[-2:]
    output = torch.empty_like(q)

    grid = (seq_len,)
    fused_attention_kernel[grid](
        q, k, v, output,
        seq_len, head_dim,
        BLOCK_SIZE=64
    )

    return output
        `
      }
    ]
  },
  'production-patterns': {
    title: 'Production Deployment',
    icon: Monitor,
    summary: 'Load balancing, auto-scaling, monitoring, and deployment patterns for production',
    concepts: [
      {
        term: 'Serving Architecture',
        definition: 'System design patterns for deploying LLM inference services at scale with high availability and performance.',
        details: 'Production LLM serving requires careful architecture design including load balancing, auto-scaling, model versioning, and monitoring to handle variable traffic while maintaining low latency and high throughput.',
        examples: [
          'Multi-tier architecture with load balancers and inference nodes',
          'Auto-scaling based on queue depth and latency metrics',
          'Blue-green deployments for model updates'
        ],
        implementation: `
# Production serving architecture
from kubernetes import client, config
import asyncio
from prometheus_client import Counter, Histogram, Gauge

class LLMServingCluster:
    def __init__(self, model_name, initial_replicas=3):
        self.model_name = model_name
        self.initial_replicas = initial_replicas

        # Metrics for monitoring
        self.request_counter = Counter('llm_requests_total',
                                     ['model', 'status'])
        self.latency_histogram = Histogram('llm_request_duration_seconds',
                                         ['model'])
        self.active_connections = Gauge('llm_active_connections',
                                      ['model'])

        # Load balancer and request queue
        self.load_balancer = LoadBalancer()
        self.request_queue = asyncio.Queue(maxsize=10000)

        # Initialize Kubernetes client
        config.load_incluster_config()
        self.k8s_apps = client.AppsV1Api()

    async def handle_request(self, request):
        start_time = time.time()

        try:
            # Add to queue with timeout
            await asyncio.wait_for(
                self.request_queue.put(request),
                timeout=5.0
            )

            # Route to available inference node
            inference_node = await self.load_balancer.get_available_node()
            response = await inference_node.generate(request)

            # Record successful request
            self.request_counter.labels(
                model=self.model_name,
                status='success'
            ).inc()

            return response

        except asyncio.TimeoutError:
            self.request_counter.labels(
                model=self.model_name,
                status='timeout'
            ).inc()
            raise HTTPException(503, Service temporarily unavailable)

        except Exception as e:
            self.request_counter.labels(
                model=self.model_name,
                status='error'
            ).inc()
            raise

        finally:
            # Record latency
            duration = time.time() - start_time
            self.latency_histogram.labels(model=self.model_name).observe(duration)

    async def auto_scale(self):
        Auto-scaling based on queue depth and latency
        while True:
            queue_depth = self.request_queue.qsize()
            current_replicas = await self.get_current_replicas()

            # Scale up if queue is backing up
            if queue_depth > 100 and current_replicas < 10:
                await self.scale_replicas(current_replicas + 1)

            # Scale down if queue is empty and we have excess capacity
            elif queue_depth < 10 and current_replicas > self.initial_replicas:
                await self.scale_replicas(current_replicas - 1)

            await asyncio.sleep(30)  # Check every 30 seconds

    async def scale_replicas(self, target_replicas):
        Scale Kubernetes deployment
        body = {'spec': {'replicas': target_replicas}}

        await self.k8s_apps.patch_namespaced_deployment_scale(
            name=f{self.model_name}-inference,
            namespace=default,
            body=body
        )

        logger.info(fScaled {self.model_name} to {target_replicas} replicas)
        `
      },
      {
        term: 'Model Quantization',
        definition: 'Technique to reduce model size and increase inference speed by using lower precision representations.',
        details: 'Quantization reduces memory footprint and computational requirements by converting model weights and activations from FP32/FP16 to INT8/INT4, enabling deployment of larger models with minimal quality loss.',
        examples: [
          'INT8 quantization: 50% memory reduction, 2x speedup',
          'INT4 quantization: 75% memory reduction, 3-4x speedup',
          'Dynamic quantization for runtime optimization'
        ],
        implementation: `
# Production quantization pipeline
import torch.quantization as quantization
from transformers import AutoModelForCausalLM

class ProductionQuantizer:
    def __init__(self, model_path):
        self.model_path = model_path
        self.calibration_data = self.load_calibration_dataset()

    def quantize_model_int8(self):
        Post-training quantization to INT8
        # Load original model
        model = AutoModelForCausalLM.from_pretrained(
            self.model_path,
            torch_dtype=torch.float32
        )

        # Prepare model for quantization
        model.eval()
        model = torch.quantization.prepare(model, inplace=False)

        # Calibration pass with representative data
        with torch.no_grad():
            for batch in self.calibration_data:
                model(batch['input_ids'])

        # Convert to quantized model
        quantized_model = torch.quantization.convert(model, inplace=False)

        return quantized_model

    def quantize_model_int4_gptq(self):
        GPTQ quantization for INT4
        from gptq import GPTQ

        # Load model in FP16
        model = AutoModelForCausalLM.from_pretrained(
            self.model_path,
            torch_dtype=torch.float16
        )

        # Initialize GPTQ quantizer
        quantizer = GPTQ(model)
        quantizer.configure(
            bits=4,
            group_size=128,
            desc_act=True  # Activation ordering
        )

        # Quantize with calibration data
        for batch in self.calibration_data:
            quantizer.add_batch(batch['input_ids'])

        quantized_model = quantizer.quantize()

        # Validate quantized model performance
        self.validate_model_quality(model, quantized_model)

        return quantized_model

    def validate_model_quality(self, original_model, quantized_model):
        Quality validation with perplexity comparison
        validation_data = self.load_validation_dataset()

        original_perplexity = self.calculate_perplexity(
            original_model, validation_data
        )
        quantized_perplexity = self.calculate_perplexity(
            quantized_model, validation_data
        )

        perplexity_increase = (quantized_perplexity / original_perplexity - 1) * 100

        if perplexity_increase > 5.0:  # 5% threshold
            raise ValueError(fQuantization degraded quality by {perplexity_increase:.1f}%)

        logger.info(fQuantization quality validated: {perplexity_increase:.1f}% degradation)

    def deploy_quantized_model(self, quantized_model, deployment_config):
        Deploy quantized model with optimized serving
        # Save quantized model in optimized format
        torch.jit.save(
            torch.jit.script(quantized_model),
            f{self.model_path}_quantized_int4.pt
        )

        # Update deployment configuration
        deployment_config.update({
            'model_path': f{self.model_path}_quantized_int4.pt,
            'precision': 'int4',
            'memory_requirement': deployment_config['memory_requirement'] * 0.25,
            'expected_speedup': '3-4x'
        })

        return deployment_config
        `
      }
    ]
  }
}

export default function InferenceSimulation() {
  // Core state
  const [activeTab, setActiveTab] = useState<'simulation' | 'concepts'>('simulation')
  const [currentTopic, setCurrentTopic] = useState<string>('prefill-decode')
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState<InferenceMetrics>({
    latency: 150,
    throughput: 1000,
    memoryUsage: 0.7,
    gpuUtilization: 0.8,
    costPerToken: 0.002,
    batchSize: 32,
    sequenceLength: 512
  })

  // Topic-specific state
  const [prefillTokens, setPrefillTokens] = useState(256)
  const [decodeTokens, setDecodeTokens] = useState(64)
  const [batchingStrategy, setBatchingStrategy] = useState<'static' | 'dynamic' | 'continuous'>('continuous')
  const [speculativeEnabled, setSpeculativeEnabled] = useState(true)
  const [parallelismType, setParallelismType] = useState(0)
  const [optimizationLevel, setOptimizationLevel] = useState(2)

  // Animation state
  const [showComparison, setShowComparison] = useState(false)
  const [animateMetrics, setAnimateMetrics] = useState(false)

  // Get current topic data
  const currentTopicData = INFERENCE_TOPICS.find(t => t.id === currentTopic) || INFERENCE_TOPICS[0]

  // Performance metrics for dashboard display
  const performanceMetrics = useMemo(() => [
    {
      label: 'Latency',
      value: `${metrics.latency.toFixed(0)}ms`,
      change: 0
    },
    {
      label: 'Throughput',
      value: `${metrics.throughput.toFixed(0)} tok/s`,
      change: 0
    },
    {
      label: 'GPU Memory',
      value: `${(metrics.memoryUsage * 100).toFixed(1)}%`,
      change: 0
    },
    {
      label: 'Cost/1K Tokens',
      value: `$${(metrics.costPerToken * 1000).toFixed(3)}`,
      change: 0
    }
  ], [metrics])

  // Simulate metrics update based on configuration
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setAnimateMetrics(true)
        setTimeout(() => setAnimateMetrics(false), 300)

        setMetrics(prev => {
          const batchConfig = BATCH_STRATEGIES[batchingStrategy]
          const parallelismConfig = PARALLELISM_CONFIGS[parallelismType]
          const optimizationMultiplier = 1 + optimizationLevel * 0.15

          return {
            latency: Math.max(50, 150 * batchConfig.latency / optimizationMultiplier + (Math.random() - 0.5) * 20),
            throughput: 1000 * batchConfig.throughput * optimizationMultiplier * parallelismConfig.efficiency + (Math.random() - 0.5) * 100,
            memoryUsage: Math.min(0.95, parallelismConfig.memory + (Math.random() - 0.5) * 0.1),
            gpuUtilization: Math.min(0.98, 0.6 + batchConfig.throughput * 0.3 + (Math.random() - 0.5) * 0.1),
            costPerToken: Math.max(0.001, 0.003 / optimizationMultiplier / batchConfig.throughput + (Math.random() - 0.5) * 0.0005),
            batchSize: prev.batchSize + Math.floor((Math.random() - 0.5) * 8),
            sequenceLength: prev.sequenceLength + Math.floor((Math.random() - 0.5) * 100)
          }
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRunning, batchingStrategy, parallelismType, optimizationLevel])

  // Handle topic change
  const handleTopicChange = (topicId: string) => {
    setCurrentTopic(topicId)
    setShowComparison(false)
  }

  // Start/stop simulation
  const toggleSimulation = () => {
    setIsRunning(!isRunning)
  }

  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentTopic('prefill-decode')
    setShowComparison(false)
    setMetrics({
      latency: 150,
      throughput: 1000,
      memoryUsage: 0.7,
      gpuUtilization: 0.8,
      costPerToken: 0.002,
      batchSize: 32,
      sequenceLength: 512
    })
  }

  const learningObjectives = [
    "Understand LLM inference phases and optimization challenges",
    "Compare different batching strategies and their trade-offs",
    "Learn about memory-efficient attention computation with vLLM",
    "Explore speculative decoding and acceleration techniques",
    "Master parallelism strategies for large-scale deployment",
    "Apply runtime optimizations for production performance"
  ]

  return (
    <SimulationLayout
      title="LLM Inference & Serving Optimization"
      description="Comprehensive exploration of production inference optimization techniques"
      difficulty="Advanced"
      category="Inference & Serving"
      onPlay={toggleSimulation}
      onReset={resetSimulation}
      isPlaying={isRunning}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
            activeTab === 'simulation'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Interactive Simulation
        </button>
        <button
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
            activeTab === 'concepts'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Key Concepts
        </button>
      </div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'simulation' && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SimulationContent />
          </motion.div>
        )}

        {activeTab === 'concepts' && (
          <motion.div
            key="concepts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <KeyConceptsContent />
          </motion.div>
        )}
      </AnimatePresence>
    </SimulationLayout>
  )

  // Simulation Content Component
  function SimulationContent() {
    return (
      <div className="space-y-8">
        {/* Topic Selection Grid */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="mr-3 text-blue-600" size={28} />
            Inference Optimization Topics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INFERENCE_TOPICS.map((topic, index) => {
              const Icon = topic.icon
              const isActive = topic.id === currentTopic

              return (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleTopicChange(topic.id)}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      isActive
                        ? `${topic.color} border-current shadow-lg`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon size={24} className={isActive ? 'text-current' : 'text-gray-400'} />
                      {isActive && <CheckCircle size={20} className="text-current" />}
                    </div>

                    <h3 className="font-bold text-lg mb-2">{topic.shortName}</h3>
                    <p className="text-sm opacity-75">{topic.description}</p>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Current Topic Deep Dive */}
        <motion.div
          key={currentTopic}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentTopicData.gradient} text-white rounded-xl p-8`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold flex items-center">
              <currentTopicData.icon className="mr-3" size={28} />
              {currentTopicData.name}
            </h3>
          </div>

          <p className="text-sm text-gray-600">{currentTopicData.explanation}</p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-gray-600">Key Concepts</h4>
              <ul className="text-sm text-gray-600">
                {currentTopicData.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    <span className="text-sm text-gray-600">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="text-sm text-gray-600">Performance Impact</h4>
              <div className="text-sm text-gray-600">
                <div className="text-sm text-gray-600">
                  <span>Latency Improvement</span>
                  <span className="text-sm text-gray-600">{currentTopic === 'speculative' ? '2-3x' :
                                               currentTopic === 'vllm-paged' ? '20-40%' :
                                               currentTopic === 'optimization' ? '30-50%' : '10-20%'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span>Throughput Gain</span>
                  <span className="text-sm text-gray-600">{currentTopic === 'batching' ? '5-10x' :
                                               currentTopic === 'parallelism' ? '4-8x' :
                                               currentTopic === 'vllm-paged' ? '2-3x' : '20-50%'}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span>Memory Efficiency</span>
                  <span className="text-sm text-gray-600">{currentTopic === 'vllm-paged' ? '60-80%' :
                                               currentTopic === 'parallelism' ? '40-60%' : '10-30%'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="block">
          {/* Configuration Panel */}
          <div className="block">
            {/* Live Metrics */}
            <div className="text-sm text-gray-600">
              <h3 className="text-sm text-gray-600">
                <BarChart3 size={20} />
                Live Performance Metrics
              </h3>

              <div className="text-sm text-gray-600">
                {[
                  { label: 'Latency', value: `${Math.round(metrics.latency)}ms`, color: 'blue', icon: Clock },
                  { label: 'Throughput', value: `${Math.round(metrics.throughput)} tok/s`, color: 'green', icon: TrendingUp },
                  { label: 'Memory Usage', value: `${Math.round(metrics.memoryUsage * 100)}%`, color: 'orange', icon: HardDrive },
                  { label: 'GPU Util', value: `${Math.round(metrics.gpuUtilization * 100)}%`, color: 'purple', icon: Cpu },
                  { label: 'Cost/Token', value: `$${metrics.costPerToken.toFixed(4)}`, color: 'red', icon: Target }
                ].map((metric, index) => {
                  const Icon = metric.icon
                  return (
                    <motion.div
                      key={metric.label}
                      animate={animateMetrics ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`flex justify-between items-center p-3 bg-${metric.color}-50 rounded-lg`}
                    >
                      <div className="text-sm text-gray-600">
                        <Icon size={16} className={`mr-2 text-${metric.color}-600`} />
                        <span className="text-sm text-gray-600">{metric.label}</span>
                      </div>
                      <span className={`font-bold text-${metric.color}-700`}>{metric.value}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Configuration Controls */}
            <div className="text-sm text-gray-600">
              <h3 className="text-sm text-gray-600">
                <Settings size={20} />
                Configuration
              </h3>

              <div className="text-sm text-gray-600">
                {/* Batching Strategy */}
                <div>
                  <label className="text-sm text-gray-600">
                    Batching Strategy
                  </label>
                  <select
                    value={batchingStrategy}
                    onChange={(e) => setBatchingStrategy(e.target.value as any)}
                    className="ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(BATCH_STRATEGIES).map(([key, config]) => (
                      <option key={key} value={key}>{config.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600">
                    {BATCH_STRATEGIES[batchingStrategy].description}
                  </p>
                </div>

                {/* Parallelism Type */}
                <div>
                  <label className="text-sm text-gray-600">
                    Parallelism Strategy
                  </label>
                  <select
                    value={parallelismType}
                    onChange={(e) => setParallelismType(parseInt(e.target.value))}
                    className="ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PARALLELISM_CONFIGS.map((config, index) => (
                      <option key={index} value={index}>{config.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600">
                    {PARALLELISM_CONFIGS[parallelismType].description}
                  </p>
                </div>

                {/* Optimization Level */}
                <div>
                  <label className="text-sm text-gray-600">
                    Runtime Optimization Level
                  </label>
                  <div className="text-sm text-gray-600">
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={optimizationLevel}
                      onChange={(e) => setOptimizationLevel(parseInt(e.target.value))}
                      className="text-sm text-gray-600"
                    />
                    <span className="text-sm text-gray-600">
                      {['None', 'Basic', 'Advanced', 'Maximum'][optimizationLevel]}
                    </span>
                  </div>
                </div>

                {/* Speculative Decoding Toggle */}
                <div className="text-sm text-gray-600">
                  <label className="text-sm text-gray-600">
                    Speculative Decoding
                  </label>
                  <button
                    onClick={() => setSpeculativeEnabled(!speculativeEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      speculativeEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        speculativeEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Visualization Panel */}
          <div className="col-span-2 space-y-6">
            {/* Topic-Specific Visualization */}
            {currentTopic === 'prefill-decode' && (
              <div className="text-sm text-gray-600">
                <h3 className="text-sm text-gray-600">
                  Prefill vs Decode Phase Visualization
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  {/* Prefill Phase */}
                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">
                      <Layers size={20} />
                      Prefill Phase
                    </h4>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Input Tokens</span>
                        <span className="text-sm text-gray-600">{prefillTokens}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Computation Type</span>
                        <span className="text-sm text-gray-600">Parallel</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Bottleneck</span>
                        <span className="text-sm text-gray-600">Compute</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Latency</span>
                        <span className="text-sm text-gray-600">{Math.round(prefillTokens * 0.1)}ms</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <label className="text-sm text-gray-600">Prefill Tokens</label>
                      <input
                        type="range"
                        min="64"
                        max="2048"
                        value={prefillTokens}
                        onChange={(e) => setPrefillTokens(parseInt(e.target.value))}
                        className="text-sm text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Decode Phase */}
                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">
                      <ArrowRight size={20} />
                      Decode Phase
                    </h4>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Output Tokens</span>
                        <span className="text-sm text-gray-600">{decodeTokens}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Computation Type</span>
                        <span className="text-sm text-gray-600">Sequential</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Bottleneck</span>
                        <span className="text-sm text-gray-600">Memory</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Latency</span>
                        <span className="text-sm text-gray-600">{Math.round(decodeTokens * 15)}ms</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <label className="text-sm text-gray-600">Decode Tokens</label>
                      <input
                        type="range"
                        min="16"
                        max="512"
                        value={decodeTokens}
                        onChange={(e) => setDecodeTokens(parseInt(e.target.value))}
                        className="text-sm text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <h4 className="text-sm text-gray-600">Total Inference Time</h4>
                  <div className="text-sm text-gray-600">
                    <div className="text-sm text-gray-600">
                      <span className="text-sm text-gray-600">{Math.round(prefillTokens * 0.1)}ms</span>
                      <span className="text-sm text-gray-600">+</span>
                      <span className="text-sm text-gray-600">{Math.round(decodeTokens * 15)}ms</span>
                      <span className="text-sm text-gray-600">=</span>
                      <span className="text-sm text-gray-600">{Math.round(prefillTokens * 0.1 + decodeTokens * 15)}ms</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Notice how decode latency dominates total inference time due to sequential generation
                  </p>
                </div>
              </div>
            )}

            {currentTopic === 'batching' && (
              <div className="text-sm text-gray-600">
                <h3 className="text-sm text-gray-600">
                  Batching Strategy Comparison
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(BATCH_STRATEGIES).map(([key, config]) => (
                    <div key={key} className="block">
                      <h4 className="text-sm text-gray-600">{config.name}</h4>
                      <p className="text-sm text-gray-600">{config.description}</p>
                      <div className="text-sm text-gray-600">
                        <div className="text-sm text-gray-600">
                          <span>Wait Time:</span>
                          <span className="text-sm text-gray-600">{config.waitTime}ms</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Throughput:</span>
                          <span className="text-sm text-gray-600">{(config.throughput * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Latency:</span>
                          <span className="text-sm text-gray-600">{(config.latency * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-600">
                  <h4 className="text-sm text-gray-600">Current Strategy: {BATCH_STRATEGIES[batchingStrategy].name}</h4>
                  <div className="block">
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {Math.round(metrics.throughput)}
                      </div>
                      <div className="text-sm text-gray-600">Throughput (tok/s)</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {Math.round(metrics.latency)}
                      </div>
                      <div className="text-sm text-gray-600">Latency (ms)</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {metrics.batchSize}
                      </div>
                      <div className="text-sm text-gray-600">Batch Size</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {Math.round(metrics.gpuUtilization * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">GPU Utilization</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'vllm-paged' && (
              <div className="text-sm text-gray-600">
                <h3 className="text-sm text-gray-600">
                  vLLM PagedAttention Memory Management
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">Traditional Attention</h4>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Memory Layout</span>
                        <span className="text-sm text-gray-600">Contiguous</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Fragmentation</span>
                        <span className="text-sm text-gray-600">High</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Memory Utilization</span>
                        <span className="text-sm text-gray-600">60-70%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Dynamic Batching</span>
                        <span className="text-sm text-gray-600">Limited</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">PagedAttention</h4>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Memory Layout</span>
                        <span className="text-sm text-gray-600">Paged (4KB blocks)</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Fragmentation</span>
                        <span className="text-sm text-gray-600">Minimal</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Memory Utilization</span>
                        <span className="text-sm text-gray-600">85-95%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Dynamic Batching</span>
                        <span className="text-sm text-gray-600">Optimal</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">Memory Efficiency Simulation</h4>
                    <div className="text-sm text-gray-600">
                      <div>
                        <div className="text-sm text-gray-600">
                          <span>Traditional Attention Memory Usage</span>
                          <span>70%</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div style={{ width: '70%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          <span>PagedAttention Memory Usage</span>
                          <span>90%</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div style={{ width: '90%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">Key Benefits</h4>
                    <ul className="text-sm text-gray-600">
                      <li>• Zero memory waste due to smart page allocation</li>
                      <li>• Dynamic sequence length support without reallocation</li>
                      <li>• Efficient memory sharing across requests</li>
                      <li>• 20-40% throughput improvement over traditional batching</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'speculative' && (
              <div className="text-sm text-gray-600">
                <h3 className="text-sm text-gray-600">
                  Speculative Decoding Acceleration
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-sm text-gray-600">
                    <div className="text-sm text-gray-600">
                      <h4 className="text-sm text-gray-600">Without Speculative Decoding</h4>
                      <div className="text-sm text-gray-600">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div key={step} className="text-sm text-gray-600">
                            <div className="text-sm text-gray-600">
                              {step}
                            </div>
                            <div className="text-sm text-gray-600">Generate token {step} (15ms)</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: 75ms for 5 tokens
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="text-sm text-gray-600">
                      <h4 className="text-sm text-gray-600">With Speculative Decoding</h4>
                      <div className="text-sm text-gray-600">
                        <div className="text-sm text-gray-600">
                          <div className="text-sm text-gray-600">
                            D
                          </div>
                          <div className="text-sm text-gray-600">Draft model: 5 tokens (5ms)</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="text-sm text-gray-600">
                            V
                          </div>
                          <div className="text-sm text-gray-600">Verify all 5 tokens (20ms)</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: 25ms for 5 tokens (3x speedup!)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">Speculative Decoding</h4>
                    <button
                      onClick={() => setSpeculativeEnabled(!speculativeEnabled)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        speculativeEnabled
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {speculativeEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      <div className="text-sm text-gray-600">
                        {speculativeEnabled ? '2.8x' : '1.0x'}
                      </div>
                      <div className="text-sm text-gray-600">Speed Improvement</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        {speculativeEnabled ? '85%' : '100%'}
                      </div>
                      <div className="text-sm text-gray-600">Acceptance Rate</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        {speculativeEnabled ? Math.round(metrics.latency * 0.6) : Math.round(metrics.latency)}
                      </div>
                      <div className="text-sm text-gray-600">Latency (ms)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'parallelism' && (
              <div className="text-sm text-gray-600">
                <h3 className="text-sm text-gray-600">
                  Parallelism Strategy Comparison
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(PARALLELISM_CONFIGS).map(([key, config]) => (
                    <div key={key} className="block">
                      <h4 className="text-sm text-gray-600">{config.name}</h4>
                      <p className="text-sm text-gray-600">{config.description}</p>
                      <div className="text-sm text-gray-600">
                        <div className="text-sm text-gray-600">
                          <span>Devices:</span>
                          <span className="text-sm text-gray-600">{config.devices}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Efficiency:</span>
                          <span className="text-sm text-gray-600">{(config.efficiency * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Memory/Device:</span>
                          <span className="text-sm text-gray-600">{(config.memory * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-600">
                  <h4 className="text-sm text-gray-600">
                    Current: {PARALLELISM_CONFIGS[parallelismType].name}
                  </h4>
                  <div className="block">
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {PARALLELISM_CONFIGS[parallelismType].devices}
                      </div>
                      <div className="text-sm text-gray-600">Devices</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {(PARALLELISM_CONFIGS[parallelismType].efficiency * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {Math.round(metrics.throughput)}
                      </div>
                      <div className="text-sm text-gray-600">Throughput</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        {(PARALLELISM_CONFIGS[parallelismType].memory * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Memory/GPU</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'optimization' && (
              <div className="text-sm text-gray-600">
                <h3 className="text-sm text-gray-600">
                  Runtime Optimization Framework
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">Optimization Techniques</h4>
                    <div className="text-sm text-gray-600">
                      {[
                        { name: 'Kernel Fusion', enabled: optimizationLevel >= 1, impact: 'Memory bandwidth' },
                        { name: 'Operator Optimization', enabled: optimizationLevel >= 2, impact: 'Compute efficiency' },
                        { name: 'Graph Optimization', enabled: optimizationLevel >= 2, impact: 'Latency reduction' },
                        { name: 'Mixed Precision', enabled: optimizationLevel >= 3, impact: 'Memory & speed' }
                      ].map((technique, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <div>
                            <span className={`text-sm ${technique.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                              {technique.name}
                            </span>
                            <div className="text-sm text-gray-600">{technique.impact}</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full ${
                            technique.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <h4 className="text-sm text-gray-600">Performance Impact</h4>
                    <div className="text-sm text-gray-600">
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Latency Reduction</span>
                        <span className="text-sm text-gray-600">{(optimizationLevel * 15 + 15)}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Throughput Gain</span>
                        <span className="text-sm text-gray-600">{(optimizationLevel * 20 + 20)}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Memory Efficiency</span>
                        <span className="text-sm text-gray-600">{(optimizationLevel * 10 + 10)}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-sm text-gray-600">Cost Reduction</span>
                        <span className="text-sm text-gray-600">{(optimizationLevel * 25 + 25)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <label className="text-sm text-gray-600">
                    Optimization Level: {['None', 'Basic', 'Advanced', 'Maximum'][optimizationLevel]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={optimizationLevel}
                    onChange={(e) => setOptimizationLevel(parseInt(e.target.value))}
                    className="text-sm text-gray-600"
                  />
                  <div className="text-sm text-gray-600">
                    <span>None</span>
                    <span>Basic</span>
                    <span>Advanced</span>
                    <span>Maximum</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <h4 className="text-sm text-gray-600">Framework Comparison</h4>
                  <div className="text-sm text-gray-600">
                    <div>
                      <span className="text-sm text-gray-600">TensorRT-LLM:</span> NVIDIA GPUs, maximum performance
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">ONNX Runtime:</span> Cross-platform, good optimization
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Comparison */}
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-gray-600">
                  Overall Performance Dashboard
                </h3>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  {showComparison ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="text-sm font-medium text-gray-900">{metric.label}</div>
                    <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                    {isRunning && metric.change !== 0 && (
                      <div className={`text-xs font-medium ${
                        (metric.label === 'Latency' || metric.label === 'Cost/1K Tokens' || metric.label === 'GPU Memory')
                          ? metric.change < 0 ? 'text-green-600' : 'text-red-600'
                          : metric.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-gray-600"
                >
                  <h4 className="text-sm text-gray-600">Optimization Impact Summary</h4>
                  <div className="text-sm text-gray-600">
                    {[
                      { name: 'Baseline (no optimizations)', latency: 300, throughput: 500, cost: 0.006 },
                      { name: 'With batching + parallelism', latency: 180, throughput: 800, cost: 0.004 },
                      { name: 'Add vLLM PagedAttention', latency: 150, throughput: 1000, cost: 0.003 },
                      { name: 'Full optimization stack', latency: Math.round(metrics.latency), throughput: Math.round(metrics.throughput), cost: metrics.costPerToken }
                    ].map((config, index) => (
                      <div key={index} className="text-sm text-gray-600 border-b p-3">
                        <span className="text-sm text-gray-600">{config.name}</span>
                        <div className="text-sm text-gray-600">
                          <span>Latency: {config.latency}ms</span>
                          <span>Throughput: {config.throughput} tok/s</span>
                          <span>Cost: ${config.cost.toFixed(4)}/tok</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Educational Summary */}
        <div className="text-sm text-gray-600">
          <h3 className="text-sm text-gray-600">
            <Monitor className="mr-3 text-blue-600" size={24} />
            Production Inference Optimization
          </h3>

          <div className="block">
            <div className="text-sm text-gray-600">
              <h4 className="text-sm text-gray-600">Key Principles</h4>
              <ul className="text-sm text-gray-600">
                <li>• Optimize prefill and decode phases differently</li>
                <li>• Memory management is critical for scaling</li>
                <li>• Batching strategies affect latency/throughput trade-offs</li>
                <li>• Parallelism enables large model deployment</li>
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              <h4 className="text-sm text-gray-600">Production Impact</h4>
              <ul className="text-sm text-gray-600">
                <li>• 10x+ throughput improvements possible</li>
                <li>• 2-3x latency reductions with speculative decoding</li>
                <li>• 60%+ cost reduction through optimization</li>
                <li>• Better user experience and resource utilization</li>
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              <h4 className="text-sm text-gray-600">Future Directions</h4>
              <ul className="text-sm text-gray-600">
                <li>• Hardware-software co-design</li>
                <li>• Advanced scheduling algorithms</li>
                <li>• Dynamic model adaptation</li>
                <li>• Edge deployment optimizations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Key Concepts Content Component
  function KeyConceptsContent() {
    const [selectedConcept, setSelectedConcept] = useState<string>('fundamentals')
    const [expandedConcept, setExpandedConcept] = useState<string | null>(null)

    const conceptSections = Object.entries(INFERENCE_KEY_CONCEPTS)

    return (
      <div className="space-y-8">
        {/* Concept Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="mr-3 text-blue-600" size={28} />
            Inference & Serving Optimization Concepts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {conceptSections.map(([key, section]) => {
              const isActive = selectedConcept === key
              const Icon = section.icon
              return (
                <motion.button
                  key={key}
                  onClick={() => setSelectedConcept(key)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center mb-2">
                    <Icon size={24} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                    <span className="ml-3 text-sm font-medium text-gray-900">{section.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{section.summary}</p>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Selected Concept Details */}
        <motion.div
          key={selectedConcept}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-sm text-gray-600">
            <div className="text-sm text-gray-600">
              {(() => {
                const IconComponent = INFERENCE_KEY_CONCEPTS[selectedConcept as keyof typeof INFERENCE_KEY_CONCEPTS].icon
                return <IconComponent size={24} />
              })()}
            </div>
            <h3 className="text-sm text-gray-600">
              {INFERENCE_KEY_CONCEPTS[selectedConcept as keyof typeof INFERENCE_KEY_CONCEPTS].title}
            </h3>
          </div>

          <div className="text-sm text-gray-600">
            {INFERENCE_KEY_CONCEPTS[selectedConcept as keyof typeof INFERENCE_KEY_CONCEPTS].concepts.map((concept, index) => (
              <div key={index} className="text-sm text-gray-600">
                <button
                  onClick={() => setExpandedConcept(expandedConcept === `${selectedConcept}-${index}` ? null : `${selectedConcept}-${index}`)}
                  className="block">
                  <div className="text-sm text-gray-600">
                    <div>
                      <h4 className="text-sm text-gray-600">{concept.term}</h4>
                      <p className="text-sm text-gray-600">{concept.definition}</p>
                    </div>
                    <ChevronDown
                      className={`transform transition-transform ${
                        expandedConcept === `${selectedConcept}-${index}` ? 'rotate-180' : ''
                      }`}
                      size={24}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedConcept === `${selectedConcept}-${index}` && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-gray-600"
                    >
                      <div className="text-sm text-gray-600">
                        {/* Detailed explanation */}
                        <div>
                          <h5 className="text-sm text-gray-600">Detailed Explanation</h5>
                          <p className="text-sm text-gray-600">{concept.details}</p>
                        </div>

                        {/* Examples */}
                        <div>
                          <h5 className="text-sm text-gray-600">Real-world Examples</h5>
                          <div className="space-y-2">
                            {concept.examples?.map((example, exampleIndex) => (
                              <div key={exampleIndex} className="bg-gray-50 p-3 rounded">
                                <p className="text-sm text-gray-600">{example}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Implementation */}
                        <div>
                          <h5 className="text-sm text-gray-600">Implementation Example</h5>
                          <div className="text-sm text-gray-600">
                            <pre className="text-sm text-gray-600">
                              <code>{concept.implementation.trim()}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Production Readiness Checklist */}
        <div className="text-sm text-gray-600">
          <h3 className="text-sm text-gray-600">
            <CheckCircle className="mr-3" text-green-600 size={24} />
            Production Inference Deployment Checklist
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-sm text-gray-600">
              <h4 className="text-sm text-gray-600">Performance Optimization</h4>
              {[
                'Implement continuous batching for optimal throughput',
                'Enable speculative decoding for 2-3x speedup',
                'Use quantization (INT8/INT4) to reduce memory',
                'Deploy tensor parallelism for large models',
                'Optimize kernels with fusion techniques'
              ].map((item, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <CheckCircle size={16} className="text-sm text-gray-600" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              <h4 className="text-sm text-gray-600">Production Operations</h4>
              {[
                'Set up monitoring for latency, throughput, and errors',
                'Implement auto-scaling based on queue depth',
                'Configure load balancing across inference nodes',
                'Establish model versioning and rollback procedures',
                'Plan capacity for peak traffic patterns'
              ].map((item, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <CheckCircle size={16} className="text-sm text-gray-600" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-sm text-gray-600">
            <Target className="mr-3" text-purple-600 size={24} />
            Recommended Learning Path
          </h3>

          <div className="text-sm text-gray-600">
            {[
              {
                step: 1,
                title: "Master Inference Fundamentals",
                description: "Understand prefill vs decode phases, KV-cache management",
                duration: "2-3 weeks"
              },
              {
                step: 2,
                title: "Learn Batching Strategies",
                description: "Static, dynamic, and continuous batching implementation",
                duration: "1-2 weeks"
              },
              {
                step: 3,
                title: "Explore Memory Optimization",
                description: "PagedAttention, KV-cache optimization, memory profiling",
                duration: "2-3 weeks"
              },
              {
                step: 4,
                title: "Apply Acceleration Techniques",
                description: "Speculative decoding, tensor parallelism, kernel fusion",
                duration: "3-4 weeks"
              },
              {
                step: 5,
                title: "Production Deployment",
                description: "Serving architecture, quantization, monitoring",
                duration: "2-3 weeks"
              }
            ].map((item, index) => (
              <div key={index} className="text-sm text-gray-600">
                <div className="text-sm text-gray-600">
                  {item.step}
                </div>
                <div className="text-sm text-gray-600">
                  <h4 className="text-sm text-gray-600">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <span className="text-sm text-gray-600">{item.duration}</span>
                </div>
                {index < 4 && <ArrowRight size={16} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}