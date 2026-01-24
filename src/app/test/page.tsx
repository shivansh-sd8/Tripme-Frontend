"use client";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';



{/* Soft Prompt – Help Host Prepare */}
export default function TestPage() {

    const [showIntroPrompt, setShowIntroPrompt] = useState(false);
  return (
<div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
  <button
    onClick={() => setShowIntroPrompt(prev => !prev)}
    className="w-full flex items-center justify-between p-6 text-left"
  >
    <div>
      <h3 className="text-lg font-semibold text-gray-900">
        Help your host prepare
      </h3>
      <p className="text-sm text-gray-500">
        Optional · Takes less than a minute
      </p>
    </div>
    <ChevronDown
      className={`w-5 h-5 text-gray-500 transition-transform ${
        showIntroPrompt ? 'rotate-180' : ''
      }`}
    />
  </button>

  {showIntroPrompt && (
    <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
      
      {/* Who’s coming */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Who’s coming with you?
        </label>
        <select className="w-full border rounded-lg px-3 py-2">
          <option>Family</option>
          <option>Friends</option>
          <option>Couple</option>
          <option>Solo</option>
          <option>Work trip</option>
        </select>
      </div>

      {/* Trip purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What brings you here?
        </label>
        <input
          placeholder="Vacation, work, event..."
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Arrival time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expected arrival time
        </label>
        <input type="time" className="w-full border rounded-lg px-3 py-2" />
      </div>

      {/* Special requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anything your host should know? (optional)
        </label>
        <textarea
          rows={3}
          placeholder="Late arrival, celebration, parking needs..."
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setShowIntroPrompt(false)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Skip for now
        </button>
        <button className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700">
          Send to host
        </button>
      </div>
    </div>
  )}
</div>
  );
}
