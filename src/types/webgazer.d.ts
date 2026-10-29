declare module 'webgazer' {
  interface WebGazer {
    params: { faceMeshSolutionPath: string };
    begin(): Promise<WebGazer>;
    end(): WebGazer;
    pause(): WebGazer;
    clearData(): Promise<void>;
    clearGazeListener(): WebGazer;
    removeMouseEventListeners(): WebGazer;
    saveDataAcrossSessions(value: boolean): WebGazer;
    showVideoPreview(value: boolean): WebGazer;
    showPredictionPoints(value: boolean): WebGazer;
    applyKalmanFilter(value: boolean): WebGazer;
    recordScreenPosition(x: number, y: number, type: 'click'): WebGazer;
    getTracker(): { getPositions(): number[][] | null };
    setGazeListener(listener: (point: { x: number; y: number } | null) => void): WebGazer;
  }
  const webgazer: WebGazer;
  export default webgazer;
}
