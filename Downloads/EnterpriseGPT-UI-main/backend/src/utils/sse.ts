import { Readable } from 'stream';

/**
 * Consumes a Server-Sent-Events stream and invokes `onData` for every `data:` payload
 * emitted by the upstream. Handles multi-line data fields and chunk boundaries that split
 * an event across multiple TCP reads.
 */
export function consumeSseStream(stream: Readable, onData: (data: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    let buffer = '';

    stream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString('utf-8');
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        const dataLines = rawEvent
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim());

        if (dataLines.length) {
          onData(dataLines.join('\n'));
        }
      }
    });

    stream.on('end', () => {
      if (buffer.trim()) {
        const dataLines = buffer
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim());
        if (dataLines.length) {
          onData(dataLines.join('\n'));
        }
      }
      resolve();
    });

    stream.on('error', reject);
  });
}
