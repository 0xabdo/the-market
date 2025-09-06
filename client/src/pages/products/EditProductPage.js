import React from 'react';
import { Gamepad2 } from 'lucide-react';

const EditProductPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Edit Product</h2>
        <p className="text-gray-300">This page is under development</p>
      </div>
    </div>
  );
};

export default EditProductPage;
