import { ApiResponseProperty } from '@nestjs/swagger';
import { addSeconds } from 'date-fns';

export class RefreshTokenDto {
  constructor(accessToken: string, expiresAt: number) {
    this.accessToken = accessToken;
    this.expiresAt = addSeconds(new Date(), expiresAt);
  }

  @ApiResponseProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NzdkZTVlZS1lMmExLTRkNTgtYTE2YS1iNWNlMzhkOTVmNzIiLCJlbWFpbCI6ImV4YW1wbGVAZW1haWwuY29tIiwiZmFjaWxpdHkiOiI0NDhkNmI3NS1kNmFkLTRkNDAtOTNhOS1lYTdhNDk3YmFmMzgiLCJkZXBhcnRtZW50IjpudWxsLCJyb2xlIjoiaG9zcGl0YWxfYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJpdGVtczpSRUFEX1dSSVRFX0RFTEVURSIsIml0ZW1fY2F0ZWdvcmllczpSRUFEX1dSSVRFX0RFTEVURSIsInN0b2NrX2FkanVzdG1lbnQ6UkVBRF9XUklURV9ERUxFVEUiLCJpdGVtX29yZGVyczpSRUFEX1dSSVRFX0RFTEVURSIsInJlcG9ydHM6UkVBRF9XUklURV9ERUxFVEUiLCJzdXBwbGllcnM6UkVBRF9XUklURV9ERUxFVEUiLCJzYWxlczpSRUFEX1dSSVRFX0RFTEVURSIsImRlcGFydG1lbnRfcmVxdWVzdHM6UkVBRF9XUklURV9ERUxFVEUiLCJkZXBhcnRtZW50czpSRUFEX1dSSVRFX0RFTEVURSIsInVzZXJzOlJFQURfV1JJVEVfREVMRVRFIl0sInNlc3Npb24iOiIxZDhmOGFlNS00M2ZlLTRiYzYtYWY1Ni1jMWU3NTRhNzVmNGQiLCJpYXQiOjE3MzIxOTk1MDAsImV4cCI6MTczMjIwMzEwMCwiYXVkIjoibG9jYWxob3N0OjU1MDAiLCJpc3MiOiJsb2NhbGhvc3Q6NTUwMCJ9.nJCniuKnFF4j4sBnF7myr3hthvDkqKI_Fx-DVwdwUGk',
  })
  accessToken: string;

  @ApiResponseProperty({
    example: addSeconds(new Date(), 3600),
  })
  expiresAt: Date;
}
