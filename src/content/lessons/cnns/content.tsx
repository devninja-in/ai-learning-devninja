'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import CNNSim from '@/components/simulations/CNNSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function CNNsContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Close your eyes and think of a cat. You didn&apos;t picture a list of pixel
            values, did you? You pictured ears, whiskers, fur &mdash; <em>features</em>.
            Your brain automatically breaks down images into meaningful parts. CNNs do
            something surprisingly similar. They learn to detect edges, then shapes, then
            objects &mdash; building up from simple to complex, layer by layer.
          </p>

          <p className="text-gray-700 leading-relaxed">
            A regular neural network sees an image as one flat list of numbers. Every pixel
            connects to every neuron. That works for small images, but for a 1080p photo
            with 6 million pixels? You&apos;d need billions of connections in the first
            layer alone. Worse, it throws away all spatial structure &mdash; it doesn&apos;t
            know that neighboring pixels are related.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Convolutional Neural Networks (CNNs) solve this by doing what your visual cortex
            does: look at small patches of the image at a time, detect local patterns, and
            gradually assemble them into bigger concepts. A pixel alone means nothing. A
            patch of pixels might be an edge. A group of edges might be a circle. A circle
            in the right place might be an eye. An eye plus other features? That&apos;s a
            face. CNNs learn this hierarchy automatically.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Filters that learn to see">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The core idea of a CNN is the <strong>convolution operation</strong>. Instead of
            connecting every pixel to every neuron, you slide a small filter (typically 3x3 or
            5x5) across the image, computing a dot product at each position. The filter is
            just a tiny grid of weights &mdash; numbers that the network learns during
            training.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Think of the filter as a pattern detector. A filter with values like
            [-1, 0, 1] across columns will fire strongly wherever it finds a vertical
            edge &mdash; a sharp transition from dark to light. A different filter might
            detect horizontal edges, diagonal lines, or specific textures. Early in
            training, filters start random and meaningless. As the network trains, they
            evolve into useful pattern detectors.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The output of sliding one filter across the entire image is called a
            <strong> feature map</strong> &mdash; a new, smaller image where each pixel
            tells you &quot;how strongly did this pattern appear at this location?&quot;
            Multiple filters run in parallel, each producing its own feature map,
            each looking for a different pattern. A typical first layer might have
            32 or 64 filters running simultaneously.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The CNN pipeline"
              nodes={[
                { id: 'image', label: 'Image', type: 'input' },
                { id: 'conv', label: 'Conv Filters', sublabel: '(detect patterns)', type: 'process' },
                { id: 'fmap', label: 'Feature Maps', type: 'attention' },
                { id: 'pool', label: 'Pooling', sublabel: '(shrink)', type: 'process' },
                { id: 'more', label: 'More Layers', sublabel: '(deeper patterns)', type: 'attention' },
                { id: 'class', label: 'Classification', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            One key property makes this work: <strong>weight sharing</strong>. The same filter
            slides across the entire image, so a vertical edge detector works whether the
            edge is in the top-left corner or the bottom-right. This dramatically reduces the
            number of parameters compared to a fully connected network, and it means CNNs are
            naturally translation-invariant &mdash; they can recognize a cat whether it&apos;s
            centered or off to the side.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Building up from edges to objects">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            A CNN is a stack of specialized layers. Each layer transforms its input, extracting
            increasingly abstract features. Walk through the four main operations that make
            a CNN work.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Convolution',
                content: (
                  <div className="space-y-4">
                    <p>
                      A small 3x3 filter slides across the image one pixel at a time. At each
                      position, it computes a <strong className="text-white">dot product</strong> &mdash;
                      multiply each filter weight by the corresponding pixel value, then sum
                      everything up. The result goes into the output feature map.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Image Patch</span>
                        <div className="text-white text-xs mt-1 font-mono">[1,0,1 / 0,1,0 / 1,0,1]</div>
                      </div>
                      <div className="text-gray-500 text-xl font-mono">&times;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Filter</span>
                        <div className="text-white text-xs mt-1 font-mono">[-1,0,1 / -1,0,1 / -1,0,1]</div>
                      </div>
                      <div className="text-gray-500 text-xl">=</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Output</span>
                        <div className="text-white text-lg mt-1 font-mono font-bold">0.0</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Each filter detects exactly one type of pattern. Strong positive output means
                      &quot;this pattern is here.&quot; Near-zero means &quot;nothing interesting.&quot;
                      Negative means &quot;the opposite pattern is here.&quot;
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Feature Maps',
                content: (
                  <div className="space-y-4">
                    <p>
                      A single filter produces one feature map. But CNNs run <strong className="text-white">dozens
                      or hundreds of filters in parallel</strong>, each producing its own feature map.
                      Together, they capture a rich description of what&apos;s in the image.
                    </p>

                    <div className="grid grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Early Layers</span>
                        <div className="text-white text-xs mt-2">Edges, gradients, simple textures</div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Middle Layers</span>
                        <div className="text-white text-xs mt-2">Shapes, corners, patterns, parts</div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Deep Layers</span>
                        <div className="text-white text-xs mt-2">Eyes, wheels, faces, whole objects</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This hierarchy is the core insight: each layer builds on the patterns found
                      by the previous layer. You don&apos;t need to hand-design these features &mdash;
                      the network learns them from data.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Pooling',
                content: (
                  <div className="space-y-4">
                    <p>
                      Feature maps are large, and we want the network to be invariant to small
                      shifts in position. <strong className="text-white">Pooling</strong> shrinks
                      the feature maps by summarizing small regions. The most common approach
                      is <strong className="text-white">max pooling</strong>: divide the feature
                      map into 2x2 blocks and keep only the maximum value from each block.
                    </p>

                    <div className="flex items-center justify-center gap-4 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Before Pooling</span>
                        <div className="text-white text-sm mt-1 font-mono">
                          [1, 3 | 2, 4]
                        </div>
                        <div className="text-gray-500 text-xs">2x2 region</div>
                      </div>
                      <div className="text-gray-500 text-2xl">&rarr;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">After Max Pool</span>
                        <div className="text-white text-lg mt-1 font-mono font-bold">4</div>
                        <div className="text-gray-500 text-xs">Keep the max</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This cuts the spatial dimensions in half (each direction), reducing computation
                      by 4x. It also makes the network care less about the exact pixel position of
                      features &mdash; just that they&apos;re roughly in the right area.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: Classification',
                content: (
                  <div className="space-y-4">
                    <p>
                      After several rounds of convolution and pooling, the feature maps are small
                      but rich with high-level information. The final step:
                      <strong className="text-white"> flatten</strong> everything into a 1D vector
                      and feed it through one or more <strong className="text-white">dense
                      (fully connected) layers</strong> that map features to predictions.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Feature Maps</span>
                        <div className="text-white text-xs mt-1">7x7x512</div>
                      </div>
                      <div className="text-gray-500">&rarr;</div>
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Flatten</span>
                        <div className="text-white text-xs mt-1">25,088 values</div>
                      </div>
                      <div className="text-gray-500">&rarr;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Dense Layers</span>
                        <div className="text-white text-xs mt-1">4096 &rarr; 4096</div>
                      </div>
                      <div className="text-gray-500">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Softmax</span>
                        <div className="text-white text-xs mt-1">1000 classes</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The dense layers learn which combinations of high-level features map to which
                      classes. &quot;Has pointy ears + whiskers + fur texture + small body?
                      Probably a cat.&quot; The softmax function converts raw scores into
                      probabilities that sum to 1.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <p className="text-gray-700 leading-relaxed">
            That&apos;s the full pipeline: slide filters across the image (convolution), keep
            the strongest signals (pooling), repeat to build higher-level features, then
            classify. The same training loop from the neural networks lesson &mdash; forward
            pass, loss, backpropagation, weight update &mdash; teaches the filters what
            patterns to look for. Nobody hand-designs the filters. The network discovers the
            right edge detectors, texture detectors, and shape detectors entirely from data.
          </p>

          <GoDeeper title="Famous architectures and transfer learning">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                CNNs have evolved dramatically since the 1990s. Understanding the landmark
                architectures helps you appreciate what makes modern CNNs work.
              </p>
              <p className="text-gray-700">
                <strong>LeNet (1998)</strong> was the pioneer &mdash; Yann LeCun used it to read
                handwritten digits on bank checks. Just two convolutional layers and a few
                dense layers. Simple, but it proved the concept.
              </p>
              <p className="text-gray-700">
                <strong>AlexNet (2012)</strong> was the breakthrough that launched the deep
                learning revolution. It won the ImageNet competition by a massive margin
                using GPU training, ReLU activations, and dropout. Suddenly the whole field
                paid attention to deep learning.
              </p>
              <p className="text-gray-700">
                <strong>VGG (2014)</strong> showed that depth matters. It used a simple recipe
                &mdash; stack 3x3 convolutions deeper and deeper (16 or 19 layers). Clean
                architecture, strong results, and still used as a feature extractor today.
              </p>
              <p className="text-gray-700">
                <strong>ResNet (2015)</strong> solved the &quot;vanishing gradient&quot; problem
                in very deep networks by introducing <em>skip connections</em> &mdash;
                shortcut paths that let gradients flow directly through the network. This
                allowed training networks with 50, 101, or even 152 layers. The insight was
                that it&apos;s easier for a layer to learn &quot;what to add&quot; to the input
                than to learn the entire transformation from scratch.
              </p>
              <p className="text-gray-700">
                <strong>Transfer learning</strong> is perhaps the most practical idea to come
                out of CNN research. Take a network pre-trained on millions of images
                (like ImageNet), freeze the early layers (which learned universal features
                like edges and textures), and retrain only the last few layers on your
                specific task. A network trained on 14 million images can be repurposed to
                classify X-rays with just a few hundred examples, because edges and shapes
                are edges and shapes regardless of domain. This is why you almost never
                train a CNN from scratch anymore.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="See convolution in action">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Here&apos;s a convolution filter you can play with. Draw a pattern on the input
            grid (click cells to toggle them), pick a filter, and watch how the convolution
            produces a feature map. Use &quot;Next Step&quot; to advance the sliding window
            one position at a time, or &quot;Auto Play&quot; to watch it scan the whole image.
            Notice how different filters highlight different features of the same input
            &mdash; edges in different directions, sharpened features, or blurred averages.
          </p>

          <CNNSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'CNNs use small, learnable filters that slide across images to detect local patterns. This is the convolution operation — a dot product between a filter and an image patch at every position.',
            'Feature maps are the output of convolution — they show where and how strongly each pattern was detected. Many filters run in parallel, each looking for something different.',
            'Deeper layers detect increasingly abstract features. Early layers find edges and textures. Middle layers combine those into shapes. Deep layers recognize whole objects. This hierarchy emerges automatically from training.',
            'Pooling (usually max pooling) shrinks feature maps, reducing computation and making the network less sensitive to exact pixel positions. It keeps the strongest signals while discarding spatial precision the network does not need.',
            'Transfer learning lets you reuse a pre-trained CNN\'s learned features for new tasks with minimal data. The early-layer features (edges, textures, shapes) are universal across image domains.',
          ]}
          misconceptions={[
            '"CNNs only work on images." — While designed for images, CNNs work on any grid-structured data. They\'re used for audio spectrograms, time series, DNA sequences, and even text classification. The key requirement is that local spatial patterns matter.',
            '"More filters and more layers always improve accuracy." — Adding capacity without enough data leads to overfitting. A ResNet-152 trained on 100 images will memorize them rather than learn useful features. Architecture, data quantity, and augmentation need to be balanced.',
            '"CNNs understand what objects are." — A CNN that classifies cats has no concept of "cat." It has learned statistical correlations between pixel patterns and labels. Research has shown CNNs can be fooled by imperceptible perturbations (adversarial examples) that change the prediction completely while looking identical to humans.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What do early layers in a CNN typically detect, compared to deeper layers?"
          options={[
            { text: 'Early layers detect objects; deeper layers detect edges', isCorrect: false },
            { text: 'Early layers detect edges and textures; deeper layers detect complex shapes and objects', isCorrect: true },
            { text: 'All layers detect the same types of features at different scales', isCorrect: false },
            { text: 'Early layers detect colors; deeper layers detect brightness', isCorrect: false },
          ]}
          explanation="CNNs build a feature hierarchy. Early layers learn simple, local patterns like edges, gradients, and textures — things that are useful everywhere. Middle layers combine those edges into more complex shapes like corners, circles, and grid patterns. The deepest layers combine those shapes into high-level concepts like eyes, wheels, or faces. This hierarchical feature learning is the fundamental insight behind CNNs and is the reason transfer learning works — the early layers learn universal features that transfer across tasks."
        />
      </LessonSection>
    </div>
  );
}
