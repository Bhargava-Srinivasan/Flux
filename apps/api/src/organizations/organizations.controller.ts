import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permissions.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Req() req: Request) {
    const userId = req.user['userId'];
    // Creating an organization is generally allowed for all authenticated users in this SaaS model.
    return this.organizationsService.create(userId, createOrganizationDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user['userId'];
    return this.organizationsService.findAll(userId);
  }

  @Post(':id/invite')
  @Permissions(Permission.ORG_INVITE_MEMBERS)
  invite(@Param('id') id: string, @Body('email') email: string, @Req() req: Request) {
    const userId = req.user['userId'];
    return this.organizationsService.invite(userId, id, email);
  }
}
