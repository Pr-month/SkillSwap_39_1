import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-access.guard';
import { AuthRequest } from '../auth/types/types';
import {
  ApiSkillsAddToFavorites,
  ApiSkillsController,
  ApiSkillsCreate,
  ApiSkillsFindAll,
  ApiSkillsRemove,
  ApiSkillsRemoveFromFavorites,
  ApiSkillsUpdate,
} from './skills.swagger';

@ApiSkillsController()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiSkillsFindAll()
  @Get()
  findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @ApiSkillsCreate()
  @Post()
  create(@Body() dto: CreateSkillDto) {
    return this.skillsService.create(dto);
  }

  @ApiSkillsUpdate()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSkillDto) {
    return this.skillsService.update(id, dto);
  }

  @ApiSkillsRemove()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }

  @ApiSkillsRemoveFromFavorites()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id') skillId: string,
    @Req() req: AuthRequest,
  ) {
    return this.skillsService.removeFromFavoriteSkill(skillId, req.user.sub);
  }

  @ApiSkillsAddToFavorites()
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(@Param('id') skillId: string, @Req() req: AuthRequest) {
    return this.skillsService.addToFavoriteSkill(skillId, req.user.sub);
  }
}
