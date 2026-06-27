import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, message = 'Are you sure?' }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm">
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="px-3 py-1.5 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
