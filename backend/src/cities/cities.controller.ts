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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать город' })
  @ApiCreatedResponse({
    description: 'Город успешно создан',
    type: String,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для создания города',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Post()
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @ApiOperation({ summary: 'Получить список городов' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск городов по части названия',
    example: 'моск',
  })
  @ApiOkResponse({
    description: 'Список городов',
    type: City,
    isArray: true,
  })
  @Get()
  findAll(@Query() query: GetCitiesQueryDto) {
    return this.citiesService.findAll(query);
  }

  @ApiOperation({ summary: 'Получить город по id' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор города',
    example: 'b0d8d2a9-1d6b-4b8b-a9f8-8b31d2f1b3a4',
  })
  @ApiOkResponse({
    description: 'Город найден',
    type: String,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citiesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить город по id' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор города',
    example: 'b0d8d2a9-1d6b-4b8b-a9f8-8b31d2f1b3a4',
  })
  @ApiOkResponse({
    description: 'Город успешно обновлен',
    type: String,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для обновления города',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(id, updateCityDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить город по id' })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор города',
    example: 'b0d8d2a9-1d6b-4b8b-a9f8-8b31d2f1b3a4',
  })
  @ApiOkResponse({
    description: 'Город успешно удален',
    type: String,
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления города',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }
}
