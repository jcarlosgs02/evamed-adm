import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatListOption } from '@angular/material/list';
import { MaterialsService } from './../../../core/services/materials/materials.service';
import { ProjectsService } from 'src/app/core/services/projects/projects.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-materials-stage',
  templateUrl: './materials-stage.component.html',
  styleUrls: ['./materials-stage.component.scss']
})

export class MaterialsStageComponent implements OnInit {

  selectedSheet: any;
  sheetNames: any;
  contentData: any;
  listData: any;
  indexSheet: number;
  ListSCRevit: any;
  ListSCDynamo: any;
  ListSCUsuario: any;
  listMateriales: any;
  selectedOptionsRevit: string[] = [];
  selectedOptionsDynamo: string[] = [];
  selectedOptionsUsuario: string[] = [];
  selectedMaterial: any;
  panelOpenFirst = false;
  panelOpenSecond = false;
  panelOpenThird = false;
  allMaterials = [];
  nameProject: string;
  projectId: number;
  SOR = [];
  SOD = [];
  SOU = [];
  sectionRevit: boolean;
  sectionDynamo: boolean;

  constructor(
    private route: ActivatedRoute,
    private materialsService: MaterialsService,
    private projectsService: ProjectsService,
    private router: Router
  ) { 
  }

  ngOnInit() {
    const PDP = JSON.parse(sessionStorage.getItem('primaryDataProject'));
    const data = JSON.parse(sessionStorage.getItem('dataProject'));
    
    this.sheetNames = [];
    this.nameProject = PDP.name_project;
    this.projectId = PDP.id;
    data.sheetNames.map( sheetname => {
      if ( sheetname !== 'Muros InterioresBis' && 
        sheetname !== 'Inicio' &&
        sheetname !== 'Registro' &&
        sheetname !== 'ListaElementos' &&
        sheetname !== 'BD' &&
        sheetname !== 'Parametros'
      ) {
        this.sheetNames.push(sheetname);
      }
    });

    this.contentData = data.data;
  }

  onGroupsChange(options: MatListOption[]) {
    options.map(option => {
      this.selectedSheet = option.value;
    });

    this.indexSheet = this.sheetNames.indexOf(this.selectedSheet);
    this.listData = this.contentData[this.indexSheet + 1];
    
    const SCRevit = [];
    const SCDynamo = [];
    // const SCUsuario = [];

    this.listData.map( sc => {
      if (sc.Origen === 'Modelo de Revit' || sc.Origen === 'Usuario') {
        SCRevit.push(sc.Sistema_constructivo);
      }
      if (sc.Origen === 'Calculado en Dynamo') {
        SCDynamo.push(sc.Sistema_constructivo);
      }
      // if (sc.Origen === 'Usuario') {
      //  SCUsuario.push(sc.Sistema_constructivo);
      // }
    });
    
    this.ListSCRevit = [...new Set(SCRevit)];
    this.ListSCDynamo = [...new Set(SCDynamo)];
    // this.ListSCUsuario = [...new Set(SCUsuario)];
    
    let i;
    for ( i = 0; i <= this.sheetNames.length; i++ ) { 
      this.indexSheet === i && this.SOR !== undefined ? this.selectedOptionsRevit = this.SOR[i] : this.selectedOptionsRevit;
      this.indexSheet === i && this.SOD !== undefined ? this.selectedOptionsDynamo = this.SOD[i] : this.selectedOptionsDynamo;
      // this.indexSheet === i && this.SOU !== undefined ? this.selectedOptionsUsuario = this.SOU[i] : this.selectedOptionsUsuario;
    }
  }

  onNgModelChangeRevit(event) {
    let i;
    for ( i = 0; i <= this.sheetNames.length; i++ ) { 
      this.indexSheet === i ? this.SOR[i] = this.selectedOptionsRevit : this.SOR[i];
    }
  }

  onNgModelChangeDynamo(event) {
    let i;
    for ( i = 0; i <= this.sheetNames.length; i++ ) { 
      this.indexSheet === i ? this.SOD[i] = this.selectedOptionsDynamo : this.SOD[i];
    }
  }

  onNgModelChangeUser(event) {
  //  let i;
  //  for ( i = 0; i <= this.sheetNames.length; i++ ) { 
  //    this.indexSheet === i ? this.SOU[i] = this.selectedOptionsUsuario : this.SOU[i];
  //  }
  }

  onNgModelChangeMaterial(event) {
    // console.log(this.selectedMaterial);
  }

  showMaterials(event, sc, origin) {
    const materiales = [];
    this.listData.map( data => {
      if (data.Sistema_constructivo === sc && origin === 'revit-user') {
        if(data.Origen === 'Modelo de Revit' || data.Origen === 'Usuario') {
          materiales.push(data.Material); 
        }
      }
      if (data.Sistema_constructivo === sc && origin === 'dynamo') { 
        if(data.Origen === 'Calculado en Dynamo') {
          materiales.push(data.Material); 
        }
      }
    });
    this.listMateriales = materiales;
  }

  saveStepOne() {
    // Save Modelo Revit and Usuario
    Object.entries(this.SOR).forEach(([key, value]) => {
      this.contentData[parseInt(key) + 1].map(data => { 
        value.map(sc => {
          if (data.Sistema_constructivo === sc) { 
            if (data.Origen === 'Modelo de Revit' || data.Origen === 'Usuario') {
              this.materialsService.searchMaterial(data.Material).subscribe( material => {
                material.map( materialData => {
                  if(materialData.name_material === data.Material) {
                    this.projectsService.addSchemeProject({
                      "construction_system": data.Sistema_constructivo,
                      "quantity": data.Cantidad,
                      "provider_distance": 0,
                      "material_id":  materialData.id,
                      "project_id": this.projectId,
                      "origin_id": 1,
                      "section_id": parseInt(key) + 1
                    }).subscribe(data => {
                      console.log('Success!');
                      console.log(data);
                    });
                  }
                });
              });
            }
          }
        });
      });   
    });

    // Save Dynamo
    Object.entries(this.SOD).forEach(([key, value]) => {
      this.contentData[parseInt(key) + 1].map(data => { 
        value.map(sc => {
          if (data.Sistema_constructivo === sc) { 
            if (data.Origen === 'Cálculo en Dynamo' ) {
              this.materialsService.searchMaterial(data.Material).subscribe( material => {
                material.map( materialData => {
                  if(materialData.name_material === data.Material) {
                    this.projectsService.addSchemeProject({
                      "construction_system": data.Sistema_constructivo,
                      "quantity": data.Cantidad,
                      "provider_distance": 0,
                      "material_id":  materialData.id,
                      "project_id": this.projectId,
                      "origin_id": 2,
                      "section_id": parseInt(key) + 1
                    }).subscribe(data => {
                      console.log('Success!');
                      console.log(data);
                    });
                  }
                });
              });
            }
          }
        });
      });   
    });
  
    this.router.navigateByUrl('construction-stage');
  }
}