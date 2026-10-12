// DTO de atualizacao: nao deixamos trocar o dono (usuarioId) do perfil.
// OmitType = copia o DTO REMOVENDO campos; PartialType = deixa o resto opcional.
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDto } from './create-perfil.dto';

export class UpdatePerfilDto extends PartialType(
  OmitType(CreatePerfilDto, ['usuarioId'] as const),
) {}
