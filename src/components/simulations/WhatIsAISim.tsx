'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailExample {
  text: string;
  supervised: { label: 'Spam' | 'Not Spam'; confidence: number };
  unsupervised: { group: string; description: string; similarCount: number };
}

const emails: EmailExample[] = [
  {
    text: 'Congratulations! You won $1,000,000!',
    supervised: { label: 'Spam', confidence: 94 },
    unsupervised: { group: 'Group A', description: 'Promotional', similarCount: 3 },
  },
  {
    text: 'Meeting moved to 3pm tomorrow',
    supervised: { label: 'Not Spam', confidence: 98 },
    unsupervised: { group: 'Group C', description: 'Work', similarCount: 12 },
  },
  {
    text: 'Your package has shipped! Track it here',
    supervised: { label: 'Not Spam', confidence: 76 },
    unsupervised: { group: 'Group B', description: 'Notifications', similarCount: 8 },
  },
  {
    text: 'URGENT: Verify your account now!!!',
    supervised: { label: 'Spam', confidence: 91 },
    unsupervised: { group: 'Group A', description: 'Promotional', similarCount: 5 },
  },
];

export default function WhatIsAISim() {
  const [mode, setMode] = useState<'supervised' | 'unsupervised'>('supervised');
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Email Classifier</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setMode('supervised'); setSelectedEmail(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'supervised'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Supervised
          </button>
          <button
            onClick={() => { setMode('unsupervised'); setSelectedEmail(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'unsupervised'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unsupervised
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {mode === 'supervised'
          ? 'The model learned from thousands of labeled examples (spam / not spam) and now predicts a label for new emails.'
          : 'The model has no labels. It groups emails by similarity and discovers patterns on its own.'}
      </p>

      <div className="space-y-3 mb-6">
        {emails.map((email, index) => (
          <button
            key={index}
            onClick={() => setSelectedEmail(index)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
              selectedEmail === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <span className="text-gray-700">{email.text}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedEmail !== null && (
          <motion.div
            key={`${mode}-${selectedEmail}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="border border-gray-200 rounded-lg p-5 bg-gray-50"
          >
            {mode === 'supervised' ? (
              <SupervisedResult email={emails[selectedEmail]} />
            ) : (
              <UnsupervisedResult email={emails[selectedEmail]} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedEmail === null && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Click an email above to see how the model classifies it.
        </div>
      )}
    </div>
  );
}

function SupervisedResult({ email }: { email: EmailExample }) {
  const { label, confidence } = email.supervised;
  const isSpam = label === 'Spam';

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-600">Prediction:</span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isSpam
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {label}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Confidence</span>
          <span className="text-sm font-medium text-gray-900">{confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isSpam ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        The model compared this email to labeled training data and assigned a category with a confidence score.
      </p>
    </div>
  );
}

function UnsupervisedResult({ email }: { email: EmailExample }) {
  const { group, description, similarCount } = email.unsupervised;

  const groupColors: Record<string, { bg: string; text: string; bar: string }> = {
    'Group A': { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
    'Group B': { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
    'Group C': { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
  };

  const colors = groupColors[group] || groupColors['Group A'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-600">Cluster:</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
          {group}: {description}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Similar emails in cluster</span>
          <span className="text-sm font-medium text-gray-900">{similarCount}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: similarCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={`h-3 w-3 rounded-full ${colors.bar}`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        No labels were provided. The model grouped this email with similar ones based on patterns it found in the text.
      </p>
    </div>
  );
}
