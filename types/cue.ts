export interface Cue {
  id: string;
  name: string;
  type: 'color' | 'animation';
  value: string; // 色なら'#RRGGBB', アニメーションならLottieのJSONファイルのURL
}
