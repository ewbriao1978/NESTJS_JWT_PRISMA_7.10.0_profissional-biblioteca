// Rotas de /relatorios. Protegidas pelo Guard global.
import { Controller, Get, Query } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private relatorios: RelatoriosService) {}

  // GET /relatorios/emprestimos-detalhados            -> todos
  // GET /relatorios/emprestimos-detalhados?apenasAtivos=true -> so os nao devolvidos
  @Get('emprestimos-detalhados')
  emprestimos(@Query('apenasAtivos') apenasAtivos?: string) {
    // Query string chega como TEXTO ("true"), entao comparamos com 'true'.
    return this.relatorios.emprestimosDetalhados(apenasAtivos === 'true');
  }

  @Get('dashboard') // GET /relatorios/dashboard
  dashboard() {
    return this.relatorios.dashboard();
  }
}
