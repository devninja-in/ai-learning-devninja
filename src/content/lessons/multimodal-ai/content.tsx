'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import MultimodalSim from '@/components/simulations/MultimodalSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function MultimodalAIContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            For decades, AI was a specialist. Vision models couldn&apos;t read
            text. Language models couldn&apos;t see images. They lived in
            separate worlds. Then something interesting happened &mdash;
            researchers figured out how to teach models to understand both at
            once. Now you can show GPT-4 a photo of your fridge and ask
            &ldquo;what can I cook with this?&rdquo; That&apos;s multimodal AI.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The idea is deceptively simple: instead of building separate systems
            for text, images, and audio, build one system that understands all
            of them. The breakthrough that made this possible? Finding a way to
            represent different modalities &mdash; words, pixels, sound waves
            &mdash; in the same mathematical space. Once everything lives in
            the same vector space, you can compare, search, and translate
            across modalities as easily as comparing two sentences.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This lesson covers the three main approaches to multimodal AI:
            contrastive models like CLIP that connect text and images,
            vision-language models like GPT-4V that reason about images, and
            diffusion models like Stable Diffusion that generate images from
            text. Each takes a different angle on the same fundamental
            challenge &mdash; bridging the gap between how humans experience
            the world and how machines process it.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept — One brain, many senses */}
      <LessonSection id="concept" title="One brain, many senses">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Your brain does something remarkable: when you hear the word
            &ldquo;dog,&rdquo; see a photo of a dog, or hear a bark, the same
            concept lights up. Different inputs, same understanding. Multimodal
            AI tries to replicate this. The key insight is to map different
            modalities &mdash; text, images, audio &mdash; into the same vector
            space. When that works, a photo of a golden retriever and the text
            &ldquo;a happy dog playing fetch&rdquo; end up as nearby points in
            that shared space, even though one started as pixels and the other
            as words.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="Mapping modalities to a shared space"
              nodes={[
                { id: 'image', label: 'Image', sublabel: 'Raw pixels', type: 'input' },
                { id: 'vision-enc', label: 'Vision Encoder', sublabel: 'ViT, ResNet', type: 'process' },
                { id: 'shared', label: 'Shared Vector Space', sublabel: 'Similar concepts cluster together', type: 'attention' },
                { id: 'text-enc', label: 'Text Encoder', sublabel: 'Transformer', type: 'process' },
                { id: 'text', label: 'Text', sublabel: 'Words and sentences', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            This is the same idea behind word embeddings from earlier in the
            course, but extended across modalities. Word2Vec put similar words
            near each other. CLIP puts similar <em>concepts</em> near each
            other, regardless of whether that concept came from text or an
            image. And the same principle extends further &mdash; models like
            Whisper do it for audio, and emerging models handle video, 3D
            objects, and even tactile data.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Why does this matter practically? Because once you have a shared
            space, cross-modal tasks become easy. Want to search a million
            photos using a text description? Encode the text, find the nearest
            image vectors. Want to caption an image? Encode it and decode
            into language. Want to generate an image from text? Project from
            the text space into the image space. One representation unlocks
            all of these capabilities.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works — Three flavors of multimodal */}
      <LessonSection id="how-it-works" title="Three flavors of multimodal">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            There is no single &ldquo;multimodal architecture.&rdquo; The field
            has converged on three major approaches, each designed for different
            tasks. Understanding all three gives you a complete picture of how
            AI handles multiple modalities today.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Contrastive Learning (CLIP)',
                content: (
                  <div className="space-y-4">
                    <p>
                      OpenAI&apos;s CLIP was trained on{' '}
                      <strong className="text-white">400 million image-text pairs</strong>{' '}
                      scraped from the internet. The training objective is elegantly
                      simple: given a batch of images and captions, learn to match each
                      image with its correct caption.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">The contrastive training loop:</div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="text-blue-400">1. Take a batch of (image, text) pairs</div>
                        <div className="text-green-400">2. Encode each image with a vision encoder</div>
                        <div className="text-purple-400">3. Encode each text with a text encoder</div>
                        <div className="text-amber-400">4. Pull matching pairs close in vector space</div>
                        <div className="text-red-400">5. Push non-matching pairs apart</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The result is a model that can do{' '}
                      <strong className="text-gray-300">zero-shot image classification</strong>{' '}
                      &mdash; classify images into categories it was never explicitly
                      trained on. Just encode the category names as text, encode the
                      image, and pick the nearest text vector. CLIP can also power
                      image search, content moderation, and image-text matching. It is
                      the backbone behind many multimodal systems.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Vision-Language Models (GPT-4V, LLaVA, Claude)',
                content: (
                  <div className="space-y-4">
                    <p>
                      While CLIP connects text and images through a shared space,
                      vision-language models go further: they can{' '}
                      <strong className="text-white">reason about images</strong>{' '}
                      using language. You can show them a chart and ask them to
                      explain the trend. You can show them code on a whiteboard and
                      ask them to type it out. You can show them a meal and ask for
                      the recipe.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3">
                        <span className="text-blue-400 text-sm font-medium">Architecture</span>
                        <div className="text-white text-xs mt-2">
                          Vision encoder (ViT) extracts image features. A projection
                          layer maps them into the language model&apos;s space. The LLM
                          then processes both image tokens and text tokens together.
                        </div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-3 py-3">
                        <span className="text-green-400 text-sm font-medium">Capabilities</span>
                        <div className="text-white text-xs mt-2">
                          Image description, visual question answering, OCR, diagram
                          understanding, spatial reasoning, multi-image comparison,
                          and document analysis.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      LLaVA showed you could build a strong vision-language model by
                      fine-tuning an existing LLM (like Llama) with a frozen CLIP
                      vision encoder. GPT-4V and Claude take this further with
                      larger models and more training data. The key advantage over
                      CLIP is that these models can follow instructions, hold
                      conversations about images, and chain reasoning steps &mdash;
                      they are not just matching, they are thinking.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Diffusion Models (Stable Diffusion, DALL-E)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Diffusion models flip the script: instead of understanding
                      images, they{' '}
                      <strong className="text-white">generate images from text</strong>.
                      Type &ldquo;an astronaut riding a horse on Mars&rdquo; and get
                      a photorealistic image that never existed before. The process
                      is the reverse of understanding.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">How diffusion works:</div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="text-blue-400">1. Start with pure random noise</div>
                        <div className="text-green-400">2. The model predicts what noise to remove</div>
                        <div className="text-purple-400">3. Remove a small amount of noise (one step)</div>
                        <div className="text-amber-400">4. Repeat for 20-50 steps</div>
                        <div className="text-white">5. A coherent image emerges from the noise</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The text guidance comes from CLIP (or a similar text encoder).
                      The text prompt is encoded into a vector, and at each denoising
                      step, the model is guided toward an image that matches that
                      vector. Stable Diffusion made this technology open-source,
                      running on consumer GPUs. DALL-E 3 and Midjourney focus on
                      quality and prompt following. The underlying principle is the
                      same: learn the reverse of a noise process, conditioned on text.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Audio models, video understanding, and the grounding problem">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Audio models</strong> like OpenAI&apos;s Whisper extend
                the multimodal paradigm to speech. Whisper is trained on 680,000
                hours of multilingual audio paired with transcripts, learning to
                map speech signals into text. More recent models like AudioPaLM
                and Gemini handle audio natively alongside text and images,
                enabling tasks like audio-based question answering and
                speech-to-speech translation without intermediate text.
              </p>
              <p className="text-gray-700">
                <strong>Video understanding</strong> remains one of the harder
                frontiers. Videos add a temporal dimension &mdash; you need to
                understand what happens over time, not just what appears in a
                single frame. Models like VideoPrism and Gemini process videos
                by sampling frames and/or using temporal encoders, but the
                computational cost is enormous. A 1-minute video at 30fps
                produces 1,800 frames, each of which needs to be encoded.
                Efficient video processing is an active research area.
              </p>
              <p className="text-gray-700">
                <strong>The grounding problem</strong> is perhaps the deepest
                challenge. When a model says it &ldquo;sees&rdquo; a cat in an
                image, does it understand what a cat is the way you do? It has
                learned statistical associations between pixels and text labels,
                but it has never petted a cat, heard one purr, or chased one out
                of a kitchen. This gap between pattern matching and genuine
                understanding is what philosophers call the symbol grounding
                problem. Multimodal models narrow this gap by connecting more
                modalities &mdash; but whether they close it remains an open
                question.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Explore cross-modal search">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            In this simulation, you can experience how a CLIP-like model works.
            In &ldquo;Text to Image&rdquo; mode, type a description and see how
            the model ranks images by semantic similarity &mdash; the text and
            each image are encoded into the same vector space, and the closest
            matches rise to the top. Switch to &ldquo;Image to Text&rdquo; mode
            to see how a vision-language model generates captions for an image,
            ranked by confidence. Try different queries to build intuition for
            how cross-modal understanding actually works.
          </p>

          <MultimodalSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Multimodal AI maps different modalities (text, images, audio) into a shared vector space so that similar concepts cluster together regardless of whether they started as pixels, words, or sound waves.',
            'CLIP uses contrastive learning on millions of image-text pairs to create a shared embedding space. It can search images with text, do zero-shot classification, and power many downstream multimodal systems.',
            'Vision-language models like GPT-4V and LLaVA combine a vision encoder with a language model, enabling the model to reason about images, answer visual questions, and describe what it sees.',
            'Diffusion models like Stable Diffusion generate images from text by starting with random noise and iteratively denoising it, guided by a text-encoded prompt vector. They are the reverse of understanding.',
            'The shared vector space is the unifying idea. Once you can encode anything into the same space, cross-modal search, translation, and generation all become variants of the same operation: find or generate the nearest point in the target modality.',
          ]}
          misconceptions={[
            '"Multimodal models don\'t truly \'see\' -- they process learned visual features. A vision encoder extracts statistical patterns from pixels, and the language model reasons about those patterns. The model has never experienced the physical world; it works entirely from learned correlations between visual features and text descriptions."',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="How does CLIP connect images and text?"
          options={[
            { text: 'It converts images into text descriptions using OCR', isCorrect: false },
            { text: 'It maps both images and text into the same vector space and trains on matching pairs', isCorrect: true },
            { text: 'It generates images from text using a diffusion process', isCorrect: false },
            { text: 'It uses a single neural network that processes pixels and characters identically', isCorrect: false },
          ]}
          explanation="CLIP uses two separate encoders -- a vision encoder for images and a text encoder for language -- that are trained together on 400 million image-text pairs. The training objective is contrastive: pull matching image-text pairs close together in a shared vector space and push non-matching pairs apart. After training, images and text that describe similar concepts end up as nearby vectors, enabling zero-shot classification, image search, and cross-modal retrieval without any task-specific fine-tuning."
        />
      </LessonSection>
    </div>
  );
}
