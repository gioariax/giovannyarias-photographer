export function getHeadPose(positions: number[][] | null): { x: number; y: number } | null {
  if (!positions) return null;
  const points = [234, 454, 10, 152].map((index) => positions[index]);
  if (points.some((point) => !point || point.length < 3 || !point.slice(0, 3).every(Number.isFinite))) return null;
  const [left, right, forehead, chin] = points;
  const horizontal = right.map((value, axis) => value - left[axis]);
  const vertical = chin.map((value, axis) => value - forehead[axis]);
  if (Math.hypot(...horizontal) < 10 || Math.hypot(...vertical) < 10) return null;

  // The face-plane normal removes translation and scale. Its signs map the
  // unmirrored camera coordinates to the visitor's right and downward turns.
  const nx = horizontal[1] * vertical[2] - horizontal[2] * vertical[1];
  const ny = horizontal[2] * vertical[0] - horizontal[0] * vertical[2];
  const nz = horizontal[0] * vertical[1] - horizontal[1] * vertical[0];
  if (nz <= 0 || Math.hypot(nx, ny, nz) < 1) return null;
  return { x: Math.atan2(nx, nz), y: Math.atan2(-ny, Math.hypot(nx, nz)) };
}

export function getHeadTarget(pose: { x: number; y: number }, references: { x: number; y: number }[], previous = -1): number {
  if (references.length !== 3) return -1;
  const distances = references.map((reference) => Math.hypot(pose.x - reference.x, pose.y - reference.y));
  const closest = distances.indexOf(Math.min(...distances));
  if (closest === 0) return -1;
  const reference = references[closest];
  const separation = Math.min(...references.filter((_, index) => index !== closest)
    .map((other) => Math.hypot(reference.x - other.x, reference.y - other.y)));
  // Match around a learned photo center, not a generic quadrant. A wider
  // release radius prevents flicker without accepting arbitrary head turns.
  return distances[closest] <= separation * (previous === closest - 1 ? 0.75 : 0.6) ? closest - 1 : -1;
}
