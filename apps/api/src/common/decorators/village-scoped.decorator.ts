import { SetMetadata } from '@nestjs/common';

export const VILLAGE_SCOPED_KEY = 'villageScoped';
export const VillageScoped = (paramKey = 'villageId') => SetMetadata(VILLAGE_SCOPED_KEY, paramKey);
