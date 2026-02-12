// Placeholder: PermissionsGuard is combined into RolesGuard for efficiency.
// In the future, we can separate them if logic becomes complex.
// The RolesGuard checks both Roles and Permissions.

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

@Injectable()
export class PermissionsGuard extends RolesGuard {
  // Inherits logic from RolesGuard
}
