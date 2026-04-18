import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  Param,
  Query,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { RoleName, Permission } from '../common/enums/permissions.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @Roles(RoleName.OWNER, RoleName.ADMIN)
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Req() req: Request) {
    const userId = req.user['userId'];
    return this.workspacesService.create(userId, createWorkspaceDto);
  }

  @Get()
  @Roles(RoleName.OWNER, RoleName.ADMIN, RoleName.MEMBER, RoleName.GUEST)
  findAll(@Query('organizationId') organizationId: string, @Req() req: Request) {
    const userId = req.user['userId'];
    if (!organizationId) throw new ForbiddenException('Organization ID is required');
    return this.workspacesService.findAll(userId, organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user['userId'];
    return this.workspacesService.findOne(userId, id);
  }

  @Post(':id/members')
  @Permissions(Permission.WORKSPACE_MANAGE_MEMBERS)
  addMember(
    @Param('id') workspaceId: string,
    @Body('userId') memberId: string,
    @Body('role') role: string,
    @Req() req: Request,
  ) {
    const userId = req.user['userId'];
    return this.workspacesService.addMember(userId, workspaceId, memberId, role);
  }
}
