"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

/**
 * ローディングスピナーコンポーネント
 * 
 * データ読み込み中などの状態を表示するためのスピナー
 */
export function LoadingSpinner({ 
  size = 'medium',
  text = '読み込み中...'
}: LoadingSpinnerProps) {
  // サイズに基づいたクラス名を設定
  const spinnerSizeClass = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-2',
    large: 'h-16 w-16 border-4',
  }[size];
  
  const textSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${spinnerSizeClass} border-t-green-500 border-green-200`}></div>
      {text && <p className={`mt-4 text-gray-600 ${textSizeClass}`}>{text}</p>}
    </div>
  );
}
