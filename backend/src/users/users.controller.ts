import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUserId() userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  updateMe(@CurrentUserId() userId: string, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(userId, dto);
  }
}
