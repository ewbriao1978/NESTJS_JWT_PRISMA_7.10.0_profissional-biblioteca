// DTO de atualizacao de usuario.
// PartialType(RegisterDto) = copia o RegisterDto, mas deixa TODOS os campos
// opcionais (PATCH atualiza so o que for enviado). As regras de validacao
// (@IsEmail, @MinLength...) continuam valendo para os campos que vierem.
import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from '../../auth/dto/auth.dto';

export class UpdateUsuarioDto extends PartialType(RegisterDto) {}
