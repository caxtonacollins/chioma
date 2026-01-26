import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpfsService {
  private readonly ipfsApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.ipfsApiUrl = this.configService.get<string>(
      'IPFS_API_URL',
      'http://localhost:5001',
    );
  }

  async addJson(payload: Record<string, unknown>): Promise<string> {
    const formData = new FormData();
    const json = JSON.stringify(payload);
    const blob = new Blob([json], { type: 'application/json' });
    formData.append('file', blob, 'profile.json');

    const response = await fetch(`${this.ipfsApiUrl}/api/v0/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`IPFS add failed: ${message}`);
    }

    const text = await response.text();
    const lines = text.trim().split('\n');
    const last = lines[lines.length - 1];
    const parsed = JSON.parse(last);

    if (!parsed?.Hash) {
      throw new Error('Invalid IPFS response');
    }

    return parsed.Hash as string;
  }
}
