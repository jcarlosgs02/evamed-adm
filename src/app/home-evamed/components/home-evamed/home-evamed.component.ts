import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AddNewProjectComponent } from '../add-new-project/add-new-project.component';
import { ChooseTypeOfProjectComponent } from '../choose-type-of-project/choose-type-of-project.component';
import { ProjectsService } from './../../../core/services/projects/projects.service';
import { CatalogsService } from './../../../core/services/catalogs/catalogs.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ChangeNameProjectComponent } from '../change-name-project/change-name-project.component';
import { ConstructionStageService } from 'src/app/core/services/construction-stage/construction-stage.service';
import { EndLifeService } from './../../../core/services/end-life/end-life.service';
import { ElectricitConsumptionService } from './../../../core/services/electricity-consumption/electricit-consumption.service';
import { Calculos } from '../../../calculos/calculos';
@Component({
  selector: 'app-home-evamed',
  templateUrl: './home-evamed.component.html',
  styleUrls: ['./home-evamed.component.scss'],
})
export class HomeEvamedComponent implements OnInit {
  nombre: string;
  filtroUsoSeleccionado: any;
  filtroCatalogoUsos: any;
  catalogoUsos: any;
  catalogoPaises: any;
  catalogoTipo: any;
  catalogoVidaUtil: any;
  catalogoEsqHabitacional: any;
  catalogoEstados: any;
  catalogoCiudades: any;
  usoSeleccionado: number;
  paisSeleccionado: string;
  tipoSeleccionado: string;
  vidaUtilSeleccionado: string;
  esqHabitacionalSeleccionado: string;
  estadoSeleccionado: any;
  ciudadSeleccionada: any;
  superficieConstruida: string;
  superficieHabitable: string;
  noNiveles: string;
  optionSelected: string;
  projectsList: any = 0;
  tempProjectsList: any = 0;
  countProjectList: number;
  user: string;
  sector: string;
  nameProject: string;
  tagProject: string;
  sections: any;
  dataMaterial: any;
  catologoImpactoAmbiental: any;
  auxDataProjectList: any;
  ConstructiveSystemElements: any;
  sourceInformation: any;
  ACR: any;
  ECD: any;
  ECDP: any;

  public doughnutChartType = 'doughnut';
  public pieChartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    layout: {
      padding: 0,
    },
    events: ['click'],
    elements: { arc: { borderWidth: 0 } },
    tooltips: { enabled: false },
    hover: { mode: null },
    plugins: {
      datalabels: {
        color: '#FFFFFF',
        font: {
          size: 8,
        }
      }
    }
  }
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    //tooltips: { enabled: false },
    hover: { mode: null },
    legend: { display: false },
    plugins: {
      datalabels: {
        display: false
      }
    },
  };
  public barChartLabels = ['A1', 'A2', 'A3', 'A4','A5','B4','B6','C1','C2','C3','C4'];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    {data: [1,2,3,4,5,6,7,8,9,10,11]},
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private calculos: Calculos,
    private projectsService: ProjectsService,
    private catalogsService: CatalogsService,
    private projects: ProjectsService,
    private constructionStageService: ConstructionStageService,
    private users: UserService,
    private endLifeService: EndLifeService,
    private electricitConsumptionService: ElectricitConsumptionService
  ) {
    this.catalogsService.usesCatalog().subscribe((data) => {
      this.catalogoUsos = data;
      this.filtroCatalogoUsos = data;
      this.filtroCatalogoUsos.push({ id: 0, name_use: 'Todos' });
    });

    this.catalogsService.countriesCatalog().subscribe((data) => {
      this.catalogoPaises = [];
      data.map((item) => {
        if (item.id === 1) {
          this.catalogoPaises.push(item);
        }
      });
    });

    this.catalogsService.typeProjectCatalog().subscribe((data) => {
      this.catalogoTipo = data;
    });

    this.catalogsService.usefulLifeCatalog().subscribe((data) => {
      this.catalogoVidaUtil = data;
    });

    this.catalogsService.housingSchemeCatalog().subscribe((data) => {
      this.catalogoEsqHabitacional = data;
    });

    this.catalogsService.getPotentialTypes().subscribe((data) => {
      this.catologoImpactoAmbiental = this.calculos.FiltradoDeImpactos(data);
    });

    this.catalogsService.getSections().subscribe((sections) => {
      this.sections = sections;
    });

    this.projectsService
      .getMaterialSchemeProyect()
      .subscribe((dataMaterial) => {
        this.dataMaterial = dataMaterial;
      });

    this.users
      .searchUser(localStorage.getItem('email-login'))
      .subscribe((data) => {
        this.user = data[0].name;
        this.sector = data[0].institution;
        localStorage.setItem('email-id', data[0].id);
        this.projectsList = [];
        this.auxDataProjectList = [];
        this.projects.getProjects().subscribe((data) => {
          data.map((item) => {
            if (
              item.user_platform_id ===
              parseInt(localStorage.getItem('email-id'), 10)
            ) {
              let auxDatos:Record<string,any>={
                id:item.id,
                datos:this.calculos.OperacionesDeFase(item.id),
                porcentaje:this.calculos.ValoresProcentaje(this.calculos.OperacionesDeFase(item.id)),
                porcentajeSubepata:this.calculos.ValoresProcentajeSubeapa(this.calculos.OperacionesDeFase(item.id)),
                banderaEtapa:false,
                etapaSeleccionada:"Ninguna",
                subetasMostrada:[{abreviacion:"nada",color:"#FFFFFF"}],
                impactoSelect:this.calculos.ajustarNombre(this.catologoImpactoAmbiental[0]['name_complete_potential_type']),
                unit_impacto: this.catologoImpactoAmbiental[0]['unit_potential_type'],
                TipoGraficaActiva:{'Pie':true,'Bar':false},
                etapasIgnoradas:[],
                idsTextBotones:{'Producción':"ProducciónTInfo".concat(String(item.id)),'Construccion':"ConstruccionTInfo".concat(String(item.id)),'Uso':"UsoTInfo".concat(String(item.id)),'FinDeVida':"FinDeVidaTInfo".concat(String(item.id))},
                idsBotones:{'Producción':"ProducciónTextInfo".concat(String(item.id)),'Construccion':"ConstruccionTextInfo".concat(String(item.id)),'Uso':"UsoTextInfo".concat(String(item.id)),'FinDeVida':"FinDeVidaTextInfo".concat(String(item.id))},
                iconosCambio:{'Producción':'visibility_off','Construccion':'visibility_off','Uso':'visibility_off','FinDeVida':'visibility_off'},
                dataGraficaBar:this.cargarDataBar(this.calculos.ValoresProcentajeSubeapa(this.calculos.OperacionesDeFase(item.id)),this.calculos.ajustarNombre(this.catologoImpactoAmbiental[0]['name_complete_potential_type']),[]),
                dataGraficaPie: this.cargaDataPie(this.calculos.ValoresProcentajeSubeapa(this.calculos.OperacionesDeFase(item.id)),this.calculos.ajustarNombre(this.catologoImpactoAmbiental[0]['name_complete_potential_type']),[])
              }
              this.auxDataProjectList.push(auxDatos)
              this.projectsList.push(item);
            }
            this.countProjectList = this.projectsList.length;
          });
          this.auxDataProjectList.reverse();
          this.projectsList.reverse();
          this.tempProjectsList = this.projectsList;
        });
      });

    this.catalogsService.getStates().subscribe((data) => {
      this.catalogoEstados = data;
    });

    this.constructionStageService
      .getConstructiveSystemElement()
      .subscribe((data) => {
        const CSE = [];
        data.map((item) => {
          CSE.push(item);
        });
        this.ConstructiveSystemElements = CSE;
      });

    this.catalogsService
      .getSourceInformation()
      .subscribe((sourceInformation) => {
        this.sourceInformation = sourceInformation;
      });

    this.electricitConsumptionService.getACR().subscribe((data) => {
      const ACR = [];
      data.map((item) => {
        ACR.push(item);
      });
      this.ACR = ACR;
    });

    this.electricitConsumptionService.getECD().subscribe((data) => {
      const ECD = [];
      data.map((item) => {
        ECD.push(item);
      });
      this.ECD = ECD;
    });

    this.endLifeService.getECDP().subscribe((data) => {
      this.ECDP = data;
    });
  }

  ngOnInit(): void {}

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  logout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  serchSections(projectId) {
    let sectionsExist = [];

    try {
      this.sections.map((section) => {
        this.dataMaterial.map((material) => {
          if (
            material.project_id === projectId &&
            material.section_id === section.id
          ) {
            sectionsExist.push(section);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }

    return sectionsExist.filter(this.onlyUnique);
  }

  serchSC(projectId, scId) {
    let listSC = [];

    try {
      this.sections.map((section) => {
        this.dataMaterial.map((material) => {
          if (
            material.project_id === projectId &&
            material.section_id === section.id &&
            section.id === scId
          ) {
            listSC.push(material.construction_system);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }

    return listSC.filter(this.onlyUnique);
  }

  serchConstructiveSection(projectId) {
    let sectionsExist = [];
    try {
      this.sections.map((section) => {
        this.ConstructiveSystemElements.map((cs) => {
          if (cs.project_id === projectId && cs.section_id === section.id) {
            sectionsExist.push(section);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }

    return sectionsExist.filter(this.onlyUnique);
  }

  serchEndLifeSection(projectId) {
    let sectionsExist = [];
    try {
      this.sections.map((section) => {
        this.ECDP.map((ecpd) => {
          if (ecpd.project_id === projectId && ecpd.section_id === section.id) {
            sectionsExist.push(section);
          }
        });
      });
    } catch (e) {
      console.log(e);
    }

    return sectionsExist.filter(this.onlyUnique);
  }

  serchDetailConstruction(projectId, scId) {
    let list = [];

    try {
      this.sections.map((section) => {
        this.ConstructiveSystemElements.map((cs) => {
          if (
            cs.project_id === projectId &&
            cs.section_id === section.id &&
            section.id === scId
          ) {
            this.sourceInformation.map((si) => {
              if (si.id === cs.source_information_id) {
                list.push({
                  quantity: cs.quantity,
                  source_information: si.name_source_information,
                });
              }
            });
          }
        });
      });
    } catch (e) {
      console.log(e);
    }

    return list.filter(this.onlyUnique);
  }

  serchUseData(projectId) {
    let dataList = [];
    try {
      this.ACR.map((data) => {
        if (projectId === data.project_id) {
          this.ECD.map((data2) => {
            if (data.id === data2.annual_consumption_required_id) {
              dataList.push(data2);
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    return dataList.filter(this.onlyUnique);
  }

  selectUse(id) {
    this.projectsList = [];
    this.tempProjectsList.map((item) => {
      if (item.use_id === id) {
        this.projectsList.push(item);
      }

      if (id === 0) {
        this.projectsList.push(item);
      }
    });
    this.projectsList.reverse();
  }

  openDialogCTOP() {
    const dialogRef = this.dialog.open(ChooseTypeOfProjectComponent, {
      width: '900px',
      data: {
        optionSelected: 'Huella de carbono',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      try {
        this.optionSelected = result.optionSelected;
        this.router.navigateByUrl('do-files');
      } catch (e) {
        console.log('close modal');
      }
    });
  }

  deleteProject(id) {
    this.projects.deleteProject(id).subscribe((data) => {
      this.users
        .searchUser(localStorage.getItem('email-login'))
        .subscribe((data) => {
          localStorage.setItem('email-id', data[0].id);
          this.projectsList = [];
          this.auxDataProjectList = [];
          this.projects.getProjects().subscribe((data) => {
            data.map((item) => {
              if (
                item.user_platform_id ===
                parseInt(localStorage.getItem('email-id'), 10)
              ) {
                let auxDatos:Record<string,any>={
                  id:item.id,
                  datos:this.calculos.OperacionesDeFase(item.id),
                  porcentaje:this.calculos.ValoresProcentaje(this.calculos.OperacionesDeFase(item.id)),
                  porcentajeSubepata:this.calculos.ValoresProcentajeSubeapa(this.calculos.OperacionesDeFase(item.id)),
                  banderaEtapa:false,
                  iconosCambio:{'Producción':'','Construccion':'visibility_off','Uso':'visibility_off','FinDeVida':'visibility_off'},
                  etapaSeleccionada:"Ninguna",
                  subetasMostrada:[{abreviacion:"nada",color:"#FFFFFF"}],
                  impactoSelect:this.calculos.ajustarNombre(this.catologoImpactoAmbiental[0]['name_complete_potential_type']),
                  unit_impacto: this.catologoImpactoAmbiental[0]['unit_potential_type'],
                  etapasIgnoradas:[],
                  TipoGraficaActiva:{'Pie':true,'Bar':false},
                  idsTextBotones:{'Producción':"ProducciónTInfo".concat(String(item.id)),'Construccion':"ConstruccionTInfo".concat(String(item.id)),'Uso':"UsoTInfo".concat(String(item.id)),'FinDeVida':"FinDeVidaTInfo".concat(String(item.id))},
                  idsBotones:{'Producción':"ProducciónTextInfo".concat(String(item.id)),'Construccion':"ConstruccionTextInfo".concat(String(item.id)),'Uso':"UsoTextInfo".concat(String(item.id)),'FinDeVida':"FinDeVidaTextInfo".concat(String(item.id))},
                  dataGraficaBar:this.cargarDataBar(this.calculos.ValoresProcentajeSubeapa(this.calculos.OperacionesDeFase(item.id)),this.calculos.ajustarNombre(this.catologoImpactoAmbiental[0]['name_complete_potential_type']),[]),
                  dataGraficaPie: this.cargaDataPie(this.calculos.ValoresProcentajeSubeapa(this.calculos.OperacionesDeFase(item.id)),this.calculos.ajustarNombre(this.catologoImpactoAmbiental[0]['name_complete_potential_type']),[])
                }
                this.auxDataProjectList.push(auxDatos)
                this.projectsList.push(item);
              }
              this.countProjectList = this.projectsList.length;
            });
            this.auxDataProjectList.reverse();
            this.projectsList.reverse();
          });
        });
    });
  }

  renameProject(id) {
    const dialogRef = this.dialog.open(ChangeNameProjectComponent, {
      width: '680px',
      data: {
        nameProject: this.nameProject,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('result');
      console.log(result);
    });
  }

  selectImpactoAmbiental(impacto, indexRecivido) {
    this.auxDataProjectList[
      indexRecivido
    ].impactoSelect = this.calculos.ajustarNombre(impacto);
    this.auxDataProjectList[indexRecivido].etapasIgnoradas = [];
    this.catologoImpactoAmbiental.forEach((element) => {
      if (element.name_complete_potential_type === impacto) {
        this.auxDataProjectList[indexRecivido].unit_impacto =
          element.unit_potential_type;
      }
    })
    this.auxDataProjectList[indexRecivido].dataGraficaPie=this.cargaDataPie(this.auxDataProjectList[indexRecivido].porcentajeSubepata,this.auxDataProjectList[indexRecivido].impactoSelect,this.auxDataProjectList[indexRecivido].etapasIgnoradas)
    this.auxDataProjectList[indexRecivido].dataGraficaBar=this.cargarDataBar(this.auxDataProjectList[indexRecivido].porcentajeSubepata,this.auxDataProjectList[indexRecivido].impactoSelect,this.auxDataProjectList[indexRecivido].etapasIgnoradas)
  }

  selectEtapa(etapa,i,id){
    let auxSubetapas = this.calculos.findSubetapas(etapa);
    this.auxDataProjectList[i].subetasMostrada = auxSubetapas;
    if(this.auxDataProjectList[i].etapaSeleccionada === etapa){
      let auxid=etapa.concat("TextInfo".concat(String(id)))
      let auxidText=etapa.concat("TInfo".concat(String(id)))
      document.getElementById(auxid).className = 'button-info';
      document.getElementById(auxidText).style.color = '#767676';
      this.auxDataProjectList[i].banderaEtapa = false;
      this.auxDataProjectList[i].etapaSeleccionada = "Ninguna";
      this.auxDataProjectList[i].subetasMostrada = [{abreviacion:"nada",color:"#FFFFFF"}];
    }else{
      if(this.auxDataProjectList[i].etapaSeleccionada != "Ninguna"){
        let auxid=this.auxDataProjectList[i].etapaSeleccionada.concat("TextInfo".concat(String(id)))
        let auxidText=this.auxDataProjectList[i].etapaSeleccionada.concat("TInfo".concat(String(id)))
        document.getElementById(auxid).className = 'button-info';
        document.getElementById(auxidText).style.color = '#767676';
      }
      this.auxDataProjectList[i].banderaEtapa = true;
      this.auxDataProjectList[i].etapaSeleccionada = etapa;
      let auxid=this.auxDataProjectList[i].etapaSeleccionada.concat("TextInfo".concat(String(id)))
      document.getElementById(auxid).className = 'button-info-select';
      let color={'Producción':'#4DBE89','Construccion':'#0DADBA','Uso':'#8F5091','FinDeVida':'#DEA961'}
      Object.keys(color).forEach(element => {
        if(element===etapa){
          let auxid=etapa.concat("TextInfo".concat(String(id)))
          let auxidText=etapa.concat("TInfo".concat(String(id)))
          document.getElementById(auxidText).style.color = color[element];
          document.getElementById(auxid).style.borderColor = color[element];
        }
      });
    }
  }

  cargarDataBar(data,impactoU,etapasI){
    let auxdata=[];
    let auxColor=[];
    let aux=[]
    let auxl=[]
    let banderaEtapa=true;
    Object.keys(data).forEach(element => {
      if(element === impactoU){
        Object.keys(data[element]).forEach(ciclo => {
          etapasI.forEach(ei => {
            if(ei === ciclo){
              banderaEtapa=false;
            }
          });
          if(banderaEtapa){
            Object.keys(data[element][ciclo]).forEach(subetapa => {
              console.log(data[element][ciclo][subetapa].porcentaje)
              auxl.push(subetapa)
              auxdata.push(data[element][ciclo][subetapa].porcentaje)
              auxColor.push(this.calculos.findColor(subetapa))
            })
          }
          banderaEtapa=true;
        });
      }
    });
    aux=[{
      data:auxdata,
      backgroundColor:auxColor
    }]
    return {'datos':aux,'labels':auxl};
  }

  cargaDataPie(data,impactoU,etapasI){
    let auxdata=[];
    let auxColor=[];
    let aux=[]
    let banderaEtapa=true;
    Object.keys(data).forEach(element => {
      if(element === impactoU){
        Object.keys(data[element]).forEach(ciclo => {
          etapasI.forEach(ei => {
            if(ei === ciclo){
              banderaEtapa=false;
            }
          });
          if(banderaEtapa){
            Object.keys(data[element][ciclo]).forEach(subetapa => {
              auxdata.push(data[element][ciclo][subetapa].porcentaje)
              auxColor.push(this.calculos.findColor(subetapa))
            })
          }
          banderaEtapa = true;
        });
      }
    });
    aux = [
      {
        data: auxdata,
        backgroundColor: auxColor,
      },
    ];
    return aux;
  }

  eliminarEtapa(etapa,i){
    if(this.auxDataProjectList[i].etapasIgnoradas.includes(etapa)){
      this.auxDataProjectList[i].etapasIgnoradas.forEach((element,index) => {
        if(element === etapa){
          this.auxDataProjectList[i].iconosCambio[etapa] = 'visibility_off'
          this.auxDataProjectList[i].etapasIgnoradas.splice(index,1)
        }
      });
    }else{
      this.auxDataProjectList[i].iconosCambio[etapa] = 'visibility'
      this.auxDataProjectList[i].etapasIgnoradas.push(etapa)
    }
    this.auxDataProjectList[i].dataGraficaPie = this.cargaDataPie(this.auxDataProjectList[i].porcentajeSubepata,this.auxDataProjectList[i].impactoSelect,this.auxDataProjectList[i].etapasIgnoradas);
    this.auxDataProjectList[i].dataGraficaBar = this.cargarDataBar(this.auxDataProjectList[i].porcentajeSubepata,this.auxDataProjectList[i].impactoSelect,this.auxDataProjectList[i].etapasIgnoradas);
  }

  cambioGrafica(i,grafica){
    if(grafica==='Pie'){
      this.auxDataProjectList[i].TipoGraficaActiva['Pie']=true
      this.auxDataProjectList[i].TipoGraficaActiva['Bar']=false
    }
    if(grafica==='Bar'){
      this.auxDataProjectList[i].TipoGraficaActiva['Pie']=false
      this.auxDataProjectList[i].TipoGraficaActiva['Bar']=true
    }
    console.log(this.auxDataProjectList[i].dataGraficaBar)
  }

  openDialogANP() {
    const dialogRef = this.dialog.open(AddNewProjectComponent, {
      width: '680px',
      data: {
        nombre: this.nombre,
        catalogoUsos: this.catalogoUsos,
        catalogoPaises: this.catalogoPaises,
        catalogoTipo: this.catalogoTipo,
        catalogoVidaUtil: this.catalogoVidaUtil,
        catalogoEsqHabitacional: this.catalogoEsqHabitacional,
        catalogoEstados: this.catalogoEstados,
        usoSeleccionado: this.usoSeleccionado,
        paisSeleccionado: this.paisSeleccionado,
        tipoSeleccionado: this.tipoSeleccionado,
        superficieConstruida: this.superficieConstruida,
        superficieHabitable: this.superficieHabitable,
        vidaUtilSeleccionado: this.vidaUtilSeleccionado,
        esqHabitacionalSeleccionado: this.esqHabitacionalSeleccionado,
        estadoSeleccionado: this.estadoSeleccionado,
        ciudadSeleccionada: this.ciudadSeleccionada,
        noNiveles: this.noNiveles,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      try {
        this.projectsService
          .addProject({
            name_project: result.nombre,
            builded_surface: parseInt(result.superficieConstruida, 10),
            living_area: parseInt(result.superficieHabitable, 10),
            tier: parseInt(result.noNiveles, 10),
            use_id: result.usoSeleccionado,
            type_id:
              result.tipoSeleccionado === undefined
                ? null
                : result.tipoSeleccionado,
            country_id: result.paisSeleccionado,
            useful_life_id: result.vidaUtilSeleccionado,
            housing_scheme_id:
              result.esqHabitacionalSeleccionado === undefined
                ? null
                : result.esqHabitacionalSeleccionado,
            user_platform_id: parseInt(localStorage.getItem('email-id'), 10),
            city_id_origin:
              result.ciudadSeleccionada === undefined
                ? null
                : result.ciudadSeleccionada,
            distance: null,
          })
          .subscribe((data) => {
            sessionStorage.setItem('primaryDataProject', JSON.stringify(data));

            sessionStorage.setItem(
              'estadoSeleccionado',
              result.estadoSeleccionado
            );
            this.openDialogCTOP();
          });
      } catch (e) {
        console.log('close modal');
      }
    });
  }

  redirectResultados(id) {
    sessionStorage.setItem('projectID', id);
    this.router.navigateByUrl('resultados');
  }

  updateMaterial(id) {
    localStorage.setItem('idProyectoConstrucción', id);
    this.router.navigateByUrl('material-stage-update');
  }

  updateConstruction(id) {
    localStorage.setItem('idProyectoConstrucción', id);
    this.router.navigateByUrl('construction-stage-update');
  }

  updateUso(id) {
    localStorage.setItem('idProyectoConstrucción', id);
    this.router.navigateByUrl('usage-stage-update');
  }
}
