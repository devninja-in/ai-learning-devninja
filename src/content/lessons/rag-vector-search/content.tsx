'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import RAGSim from '@/components/simulations/RAGSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function RAGVectorSearchContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            LLMs have a problem: they make stuff up. Ask about your company&apos;s refund
            policy and it&apos;ll confidently invent one. Ask about a news event from last
            week and it&apos;ll hallucinate details. That&apos;s because LLMs only know
            what they learned during training, which ended months or years ago. They have
            no access to your private data, your database, or yesterday&apos;s headlines.
          </p>

          <p className="text-gray-700 leading-relaxed">
            RAG fixes this. Retrieval-Augmented Generation gives the model actual documents
            to reference before answering, like giving a student an open-book exam instead
            of relying on memory. The model searches your knowledge base, pulls the most
            relevant chunks, and uses them as context when generating the answer. The result
            is grounded, verifiable, and up-to-date.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This is how ChatGPT&apos;s web browsing works. How customer support bots answer
            questions about your product docs. How search engines are evolving beyond blue
            links. RAG is the bridge between LLMs and real-world knowledge, and it&apos;s
            one of the most practical patterns in production AI today.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Open-book AI">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Imagine you&apos;re taking a history exam. In a closed-book exam, you can only
            use what you memorized. If you forgot a date or mixed up two events, tough luck.
            But in an open-book exam, you can look things up. You still need to understand
            the material well enough to find the right page and synthesize an answer, but
            you&apos;re not relying purely on memory.
          </p>

          <p className="text-gray-700 leading-relaxed">
            That&apos;s RAG. Without RAG, an LLM is stuck in closed-book mode. It can only
            draw on patterns it learned during training. With RAG, it gets to consult external
            sources before answering. It retrieves relevant documents from a knowledge base,
            reads them, and then generates a response grounded in what it just read. The
            generation step is still done by the LLM, but now it has actual facts to work with.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="RAG Pipeline"
              nodes={[
                { id: 'question', label: 'User Question', sublabel: '"What is your refund policy?"', type: 'input' },
                { id: 'retrieve', label: 'Retrieve Docs', sublabel: 'vector search', type: 'process' },
                { id: 'augment', label: 'Augment Prompt', sublabel: 'add docs as context', type: 'process' },
                { id: 'generate', label: 'Generate Answer', sublabel: 'LLM reads docs and responds', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The beauty of RAG is that the LLM never needs to memorize your company&apos;s
            refund policy or last quarter&apos;s earnings report. Those facts live in a
            database or a document store, and the model retrieves them on demand. This
            separation of knowledge (retrieval) from reasoning (generation) is what makes
            RAG so powerful. You can update your knowledge base without retraining the model,
            and the model can answer questions about information it has never seen before.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Building a RAG pipeline">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            A RAG system has two phases: indexing (offline) and retrieval (online). In the
            indexing phase, you break your documents into chunks, convert them to vectors,
            and store them in a database. In the retrieval phase, you convert the user&apos;s
            query to a vector, find the most similar chunks, and pass them to the LLM as
            context. Let&apos;s walk through each step.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Chunking — Breaking documents into pieces',
                content: (
                  <div className="space-y-4">
                    <p>
                      LLMs have limited context windows. You can&apos;t stuff an entire
                      500-page manual into the prompt. So you split documents into smaller
                      chunks, typically 200-500 tokens each. <strong className="text-white">Chunk
                      size matters.</strong> Too large and the context gets diluted with
                      irrelevant information. Too small and you lose the surrounding meaning.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-red-400 text-sm font-medium mb-1">Too Small</div>
                        <div className="text-white text-xs">&quot;Our refund policy is...&quot;</div>
                        <div className="text-gray-500 text-xs mt-2">Lost context</div>
                      </div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-green-400 text-sm font-medium mb-1">Just Right</div>
                        <div className="text-white text-xs">Full policy paragraph</div>
                        <div className="text-gray-500 text-xs mt-2">Complete thought</div>
                      </div>
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-red-400 text-sm font-medium mb-1">Too Large</div>
                        <div className="text-white text-xs">Entire 50-page doc</div>
                        <div className="text-gray-500 text-xs mt-2">Diluted signal</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      A common trick is to add <strong className="text-white">overlap</strong> between
                      chunks. If you chunk every 300 tokens, start the next chunk 50 tokens before
                      the previous one ends. This ensures that sentences spanning chunk boundaries
                      don&apos;t get cut in half. Overlap helps preserve continuity.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Embedding & Indexing — Vector databases',
                content: (
                  <div className="space-y-4">
                    <p>
                      Once you have chunks, you convert each one to a vector using an embedding
                      model (like OpenAI&apos;s text-embedding-3-small or Cohere&apos;s embed-v3).
                      These vectors capture the semantic meaning of the text. You then store them
                      in a <strong className="text-white">vector database</strong> like Pinecone,
                      Weaviate, Chroma, or Qdrant.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 my-6 text-sm">
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded font-mono">
                        Document chunk
                      </span>
                      <span className="text-gray-400">&rarr;</span>
                      <span className="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded font-mono">
                        Embedding model
                      </span>
                      <span className="text-gray-400">&rarr;</span>
                      <span className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded font-mono">
                        [0.2, -0.5, 0.8, ...]
                      </span>
                      <span className="text-gray-400">&rarr;</span>
                      <span className="bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded font-mono">
                        Vector DB
                      </span>
                    </div>

                    <p className="text-sm text-gray-400">
                      Vector databases are optimized for <strong className="text-white">similarity
                      search.</strong> Given a query vector, they can find the K most similar
                      stored vectors in milliseconds, even across millions of documents. This is
                      the core of retrieval: you embed the user&apos;s question, search the vector
                      DB, and get back the most relevant chunks. It&apos;s semantic search at scale.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Retrieval — Hybrid search and re-ranking',
                content: (
                  <div className="space-y-4">
                    <p>
                      When a query comes in, you embed it and search the vector database for the
                      top-K most similar chunks (K is usually 3-10). This is called <strong className="text-white">
                      dense retrieval</strong> because it uses dense embeddings. But vector search
                      alone isn&apos;t perfect. It might miss exact keyword matches or domain-specific
                      jargon.
                    </p>

                    <p>
                      So many systems use <strong className="text-white">hybrid search</strong>,
                      combining vector similarity with traditional keyword search (like BM25, a
                      ranking function similar to TF-IDF). You get candidates from both methods,
                      merge them, and take the top-K. This catches both semantic matches
                      (&quot;refund&quot; ~ &quot;money back&quot;) and exact term matches
                      (&quot;warranty&quot;).
                    </p>

                    <div className="bg-gray-950 rounded-lg p-4 my-6 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">Hybrid search example:</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400">Vector:</span>
                          <span className="text-gray-300">&quot;Can I get my money back?&quot;</span>
                          <span className="text-gray-500">&rarr; Doc 1, Doc 3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400">BM25:</span>
                          <span className="text-gray-300">&quot;money back&quot; exact match</span>
                          <span className="text-gray-500">&rarr; Doc 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">Merged:</span>
                          <span className="text-gray-300">Doc 1 (highest combined score)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      After retrieval, some systems add a <strong className="text-white">re-ranker</strong>,
                      a small model (like a cross-encoder) that scores each query-document pair more
                      accurately than cosine similarity alone. The re-ranker reorders the top-K results
                      before passing them to the LLM, improving precision.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Generation — Augmenting the prompt',
                content: (
                  <div className="space-y-4">
                    <p>
                      Once you have the top-K chunks, you stuff them into the LLM&apos;s prompt as
                      context. The prompt might look like this:
                    </p>

                    <div className="bg-gray-950 rounded-lg p-4 my-6 border border-gray-700 font-mono text-xs text-gray-300">
                      <div className="text-blue-400 mb-2">System:</div>
                      <div className="mb-4">You are a helpful assistant. Use the following documents to answer the user&apos;s question.</div>
                      <div className="text-green-400 mb-2">Documents:</div>
                      <div className="mb-2 pl-4 border-l-2 border-green-500">[Doc 1]: Our company offers a 30-day money-back guarantee...</div>
                      <div className="mb-4 pl-4 border-l-2 border-green-500">[Doc 2]: To return an item, contact support@company.com...</div>
                      <div className="text-purple-400 mb-2">User:</div>
                      <div className="pl-4">Can I get my money back?</div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The LLM reads the retrieved documents and generates an answer based on them.
                      Many systems ask the model to <strong className="text-white">cite sources</strong>
                      by referencing which document(s) it used. This makes the answer verifiable and
                      builds trust. If the LLM can&apos;t find a good answer in the documents, a
                      well-designed system will say &quot;I don&apos;t know&quot; instead of hallucinating.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Advanced RAG: Multi-hop, metadata filtering, and evaluation">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Chunk size optimization</strong> is not one-size-fits-all. For FAQs, small
                chunks (100-200 tokens) work well because each question-answer pair is self-contained.
                For dense technical docs, larger chunks (400-600 tokens) preserve context. Some systems
                use <strong>hierarchical chunking</strong>, storing both paragraph-level and
                document-level chunks, and retrieving at multiple granularities.
              </p>
              <p className="text-gray-700">
                <strong>Metadata filtering</strong> lets you narrow retrieval by tags before doing
                vector search. For example, if a user asks about &quot;pricing,&quot; you can filter
                to only chunks tagged with category: &quot;pricing&quot; before running similarity
                search. This combines structured filtering with semantic search.
              </p>
              <p className="text-gray-700">
                <strong>Multi-hop retrieval</strong> handles complex questions that require multiple
                lookups. For example, &quot;Who founded the company that acquired Instagram?&quot;
                requires retrieving (1) which company acquired Instagram (Meta), then (2) who founded
                Meta (Mark Zuckerberg). Some RAG systems do iterative retrieval, generating intermediate
                queries to gather all necessary context before the final answer.
              </p>
              <p className="text-gray-700">
                <strong>Evaluation metrics</strong> for RAG systems include recall@k (did the top-K
                chunks contain the answer?), MRR (mean reciprocal rank, where did the correct chunk
                appear?), and end-to-end answer quality (human eval or LLM-as-judge). Good retrieval
                is necessary but not sufficient; you also need to measure whether the LLM actually
                uses the retrieved context correctly.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Below is a RAG pipeline visualizer. We have 5 pre-indexed documents about a
            company&apos;s policies. Select a question, toggle RAG on or off, and run the
            pipeline. Watch each stage animate: embedding the query, searching for similar
            documents, retrieving the top-3 most relevant chunks, and generating an answer.
            Compare the grounded answer (with RAG) to the hallucinated answer (without RAG).
          </p>

          <RAGSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'RAG (Retrieval-Augmented Generation) gives LLMs access to external knowledge by retrieving relevant documents before generating an answer. This grounds the response in real data instead of relying on training memory.',
            'Chunking strategy matters. Documents are split into 200-500 token chunks with overlap to preserve context. Chunk size is a tradeoff: too large dilutes relevance, too small loses meaning.',
            'Vector databases (Pinecone, Weaviate, Chroma) store document embeddings and enable fast similarity search. Given a query vector, they return the K most similar chunks in milliseconds.',
            'Hybrid search combines vector similarity (semantic) with keyword matching (BM25) to catch both conceptual and exact matches. Re-ranking with a cross-encoder further improves precision.',
            'RAG separates knowledge (retrieval) from reasoning (generation). You can update your knowledge base without retraining the model, making RAG systems easier to maintain and scale.',
          ]}
          misconceptions={[
            '"RAG eliminates hallucinations completely." -- Not quite. RAG reduces hallucinations by providing grounded context, but the LLM can still misinterpret documents or fabricate details not present in the retrieved chunks. You still need guardrails and citations.',
            '"Bigger chunk size is always better." -- Nope. Larger chunks mean more context, but also more noise. The LLM has to sift through irrelevant sentences to find the answer. Smaller, focused chunks often yield better retrieval precision.',
            '"Vector search is always better than keyword search." -- Not true. Vector search is great for semantic similarity, but it can miss exact keyword matches or domain jargon. Hybrid search (vector + BM25) often outperforms either method alone.',
            '"RAG works out of the box." -- Rarely. Production RAG systems require tuning: chunk size, overlap, embedding model choice, top-K value, re-ranking, metadata filtering, and prompt engineering. What works for FAQs may not work for legal docs.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question='Why does chunking strategy (chunk size and overlap) matter in a RAG system?'
          options={[
            { text: 'Smaller chunks make the vector database faster to search', isCorrect: false },
            { text: 'Chunk size affects retrieval precision and context quality for the LLM', isCorrect: true },
            { text: 'Overlapping chunks reduce the size of the vector database', isCorrect: false },
            { text: 'Chunking is only needed for large documents over 10,000 tokens', isCorrect: false },
          ]}
          explanation='Chunk size is a critical tradeoff. Too large and the retrieved chunks contain too much irrelevant information, diluting the signal. Too small and you lose surrounding context, making it harder for the LLM to understand the full meaning. Overlap between chunks ensures that sentences spanning chunk boundaries are not cut in half, preserving continuity. Chunking strategy directly impacts both retrieval precision (which chunks are selected) and generation quality (whether the LLM has enough context to answer correctly). It has nothing to do with database speed or size.'
        />
      </LessonSection>
    </div>
  );
}
