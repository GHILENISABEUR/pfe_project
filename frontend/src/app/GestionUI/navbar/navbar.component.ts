import { Component, OnInit,OnChanges, SimpleChanges,Renderer2,Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FrameElemntService } from 'src/app/services/frame-elemnt.service';
import { FrameService } from 'src/app/services/frame.service';
import { WebsiteService } from 'src/app/services/website.service';
import { SharedService } from 'src/app/services/shared-services.service';
import { Location } from '@angular/common';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { TableService } from 'src/app/services/table.service';

declare function draggableElement(id: any): void

interface ElementData {
  id: string;
  idframe: string|null;
  type: string;
  content: string;
  style: string | null;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  colors = [
    "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
    "#800080", "#008000", "#800000", "#008080", "#ff4500", "#ff8c00",
    "#ff69b4", "#483d8b", "#800000",
  ];

  openBgPicker = false;
  openTextPicker = false;
  idActiveframe: any;
  openSideBar = false;
  numbersArray: any = [];
  element: any;
  websiteName = '';
  openSettings = false;
  contentFrame = '';
  activeElement = '';
  titleFrame = '';
  textInputSettingsValue = '';
  sizeInputSettingsValue = '1';
  contentHtml: any;
  colorInputSettingsValue = '#ff0048';
  backgroundColorInputSettingsValue = '#ff0048';
  openStyleSection = false;
  openStyleText = false;
  textCodeValue = '';
  openTextCode = false;
  openFormFrameEdit = false;
  openFramesListe = false;
  framesList: any = [];
  activeframe: any;
  idActiveElement: any;
  frameDetails = new FormGroup({
    title: new FormControl('', [Validators.required]),
    route: new FormControl('', [Validators.required])
  });
  elements: any = [];
  textCodeEvent = '';
  frameContent = '';
  isButtonActive = false;
  openTextCodeButton = false;
  isButtonNavBar = false;
  openNavbarElement = false;
  openText = false;
  openAddBtnNav = false;
  routeBtn = '--- select route';
  openTableSetts = false;
  rowsFormData: any = [];
  openFormrow = false;
  openFormcol = false;
  openControlsTable = false;
  columnToUpdate: any;
  openFormrowUpdate = false;
  controlElement: any;
  @Input()btnvaleur: string = 'New Button';
  selectedAction:string = 'ajouter';
  CBtnid: string="";

  constructor(private location: Location,
    private frameservice: FrameService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private websiteservice: WebsiteService,
    private elementservice: FrameElemntService,
    private sharedService: SharedService,
    private renderer: Renderer2,
    private navbarservice: NavBarService,
    private TableService:TableService
  ) {}
  websiteId?: number;

  ngOnInit(): void {
    this.activeframe='null';
    this.sharedService.activeFrame$.subscribe(activeFrameId => {
      if (activeFrameId) {
        console.log("changement")
        this.elements = this.sharedService.getElements().filter(element => element.idframe === activeFrameId);
        console.log(this.elements)
        const frame = document.querySelector('.frame');
    if (frame) {
      this.TS_LoadElements(frame as HTMLElement);
    }
      } else {
        this.elements = [];
      }
    });

    this.sharedService.selectedAction$.subscribe(value => {
      this.btnvaleur = value; 
      this.updateButton();
    });
    this.TS_FillFrameContent();
    for (let i = 1; i <= 100; i++) {
      this.numbersArray.push(i.toString());
    }
    this.TS_GetFrames();
    this.TS_SetStylePositionElement();
    const frame = document.querySelector('.navbar .frame-container .frame');
    if (frame) {
      this.TS_LoadElements(frame as HTMLElement);
    }
    this.sharedService.openSettings$.subscribe(value => {
      this.openSettings = value;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Détecter les changements de la propriété d'entrée btnvaleur
    if (changes['btnvaleur'] && !changes['btnvaleur'].firstChange) {
      this.updateButton();
      this.TS_SaveElement(this.CBtnid, 'button');
    this.TS_SaveAllElements();
      this.CBtnid="";// Mettre à jour le bouton avec la nouvelle valeur

    }
   
    
  }
  TS_SetStylePositionElement() {
    this.element = document.querySelector(".frame");
    if (this.element.childNodes) {
      Array.from(this.element.childNodes).forEach((child: any) => {
        if (child.style.left.includes("px")) {
          child.style.left = (parseInt(child.style.left.replace("px", "")) / this.element.offsetWidth) * 100 + "%";
        }
        if (child.style.top.includes("px")) {
          child.style.top = (parseInt(child.style.top.replace("px", "")) / this.element.offsetHeight) * 100 + "%";
        }
        if (child.style.width.includes("px")) {
          child.style.width = (parseInt(child.style.width.replace("px", "")) / this.element.offsetWidth) * 100 + "%";
        }
        if (child.style.height.includes("px")) {
          child.style.height = (parseInt(child.style.height.replace("px", "")) / this.element.offsetHeight) * 100 + "%";
        }
      });
    }
    setTimeout(this.TS_SetStylePositionElement.bind(this), 500);
  }
  TS_GetFrames() {
    this.framesList = [];
    this.websiteservice.getById(this.route.snapshot.params['id']).subscribe({
      next: (res: any) => {
        this.websiteName = res.title;
        this.frameservice.getAll().subscribe({
          next: (r: any) => {
            this.contentHtml = this.sanitizer.bypassSecurityTrustHtml(res.content);
            r.forEach((frame: any) => {
              if (frame.webSiteId == this.route.snapshot.params['id']) {
                this.framesList.push(frame);
              }
            });
          }
        });
      }
    });
  }
  TS_AddTextToFrame(frame: HTMLElement) {
    this.activeframe=this.sharedService.getActiveFrame();
    console.log(this.activeframe);
    const text = document.createElement("p");
    text.innerText = "Title";
    text.setAttribute("style", `position:absolute;
      font-size:2vw;
      cursor: pointer;
      top:100px;
      left:300px;
      padding:1%;
      border:.1vw solid transparent;
      color:black;
      width:150px;
      height:50px;
      z-index: 10;`);
    text.setAttribute("class", "text");
    text.id = this.TS_GenerateCode(4);
    text.addEventListener("click", () => {
      this.openText = true;
      this.openNavbarElement = false;
      this.isButtonNavBar = false;
      this.isButtonActive = false;
      this.openFramesListe = false;
      this.sharedService.setOpenSettings(true);
      this.sharedService.setOpenSettingsInput(false);
      this.sharedService.setOpenFormFrameEdit(false);
      this.sharedService.setButtonClicked(false);
      this.sizeInputSettingsValue = (parseInt(text.style.fontSize.replace("vw", "")) * 10) + "";
      this.textInputSettingsValue = text.innerText;
      this.colorInputSettingsValue = text.style.color;
      this.sharedService.setActiveElement(text.id);
      this.TS_DesactiveElements();
      text.style.borderColor = "#ff0048";
      this.draggableElement(text);
      this.openControlsTable = false;
    });
    frame.appendChild(text);
    this.sharedService.addElement({ id: text.id, idframe: this.activeframe, type: 'text', content: text.innerText, style: text.getAttribute('style') });
  this.TS_SaveAllElements();
  }

  TS_AddTextInputToFrame(frame: HTMLElement) {
    this.activeframe=this.sharedService.getActiveFrame();
    const inputField = document.createElement("input");
    inputField.setAttribute("type", "text");
    inputField.setAttribute("style", `
      position:absolute;
      top:100px;
      left:300px;
      font-size:2vw;
      cursor: pointer;
      padding:1%;
      border:.1vw solid #000000;
      color:black;
      width:150px;
      height:30px;
      z-index: 10;
    `);
    inputField.id = this.TS_GenerateCode(4);
    inputField.addEventListener("click", () => {
      this.openText = true;
      this.openNavbarElement = false;
      this.isButtonNavBar = false;
      this.isButtonActive = false;
      this.openFramesListe = false;
      this.sharedService.setOpenSettingsInput(true);
      this.sharedService.setOpenSettings(false);

      this.sizeInputSettingsValue = (parseInt(inputField.style.fontSize.replace("vw", "")) * 10) + "";
      this.textInputSettingsValue = inputField.value;
      this.colorInputSettingsValue = inputField.style.color;
      this.sharedService.setActiveElement(inputField.id);
      this.TS_DesactiveElements();
      inputField.style.borderColor = "#ff0048";
      this.draggableElement(inputField);
      this.openControlsTable = false;
    });
    frame.appendChild(inputField);
    this.sharedService.addElement({ id: inputField.id,idframe:this.activeframe, type: 'input', content: inputField.value, style: inputField.getAttribute('style') });
    this.TS_SaveAllElements();
  }

draggableElement(element: HTMLElement) {
  const dragMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  };
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.onmousedown = dragMouseDown;
  const elementDrag = (e: MouseEvent) => {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    this.TS_SaveAllElements(); // Sauvegarder la position après déplacement
  };

  const closeDragElement = () => {
    document.onmouseup = null;
    document.onmousemove = null;
  };
}

  TS_SaveAllElements() {
    const elements = document.querySelectorAll('.frame .text, .frame img, .frame input, .frame button'); // Ajoutez input ici
    const elementsData: ElementData[] = Array.from(elements).map(el => ({
      id: el.id,
      idframe:this.sharedService.getActiveFrame(),
      type: el.tagName.toLowerCase(),
      content: (el.tagName.toLowerCase() === 'p') ? (el as HTMLParagraphElement).innerText
               : (el.tagName.toLowerCase() === 'input') ? (el as HTMLInputElement).value
               : (el as HTMLImageElement).src,
      style: el.getAttribute('style')
    }));
    localStorage.setItem('frameElements', JSON.stringify(elementsData));
  }
  TS_LoadElements(frame: HTMLElement) {
    const frameId = this.sharedService.getActiveFrame();
    console.log("Active Frame ID:", frameId);

    this.elements = this.sharedService.getElements().filter(element => element.idframe === frameId || element.id==='null');
    
    console.log("Filtered Elements:",this.elements);

    this.elements.forEach((data: ElementData) => {
        const element = document.createElement(data.type);
        
        // Gestion du contenu de l'élément en fonction de son type
        if (data.type === 'p') {
            (element as HTMLParagraphElement).innerText = data.content;
        } else if (data.type === 'img') {
            (element as HTMLImageElement).src = data.content;
        } else if (data.type === 'input') {
            (element as HTMLInputElement).value = data.content;
        } else if (data.type === 'div' && data.style?.includes('navbarhoriz')) {
            // Check if the element is a navbar
            element.innerHTML = data.content;
        }

        element.setAttribute('style', data.style ?? '');
        element.id = data.id;
        frame.appendChild(element);

        // Ajouter des gestionnaires d'événements en fonction du type d'élément
        if (data.type === 'p') {
            element.addEventListener("click", () => {
                this.openText = true;
                this.openNavbarElement = false;
                this.isButtonNavBar = false;
                this.isButtonActive = false;
                this.openFramesListe = false;
                this.sharedService.setOpenSettings(true);
                this.sharedService.setActiveElement(element);
                this.sizeInputSettingsValue = (parseInt((element as HTMLParagraphElement).style.fontSize.replace("vw", "")) * 10) + "";
                this.textInputSettingsValue = (element as HTMLParagraphElement).innerText;
                this.colorInputSettingsValue = element.style.color;
                this.activeElement = element.id;
                this.TS_DesactiveElements();
                element.style.borderColor = "#ff0048";
                this.draggableElement(element);
                this.openControlsTable = false;
            });
        } else if (data.type === 'input') {
            element.addEventListener("click", () => {
                this.openText = false;
                this.openNavbarElement = false;
                this.isButtonNavBar = false;
                this.isButtonActive = false;
                this.openFramesListe = false;
                this.sharedService.setOpenSettingsInput(true);
                this.sharedService.setActiveElement(element);
                this.sizeInputSettingsValue = (parseInt((element as HTMLInputElement).style.fontSize.replace("vw", "")) * 10) + "";
                this.textInputSettingsValue = (element as HTMLInputElement).value;
                this.colorInputSettingsValue = element.style.color;
                this.activeElement = element.id;
                this.TS_DesactiveElements();
                element.style.borderColor = "#ff0048";
                this.draggableElement(element);
                this.openControlsTable = false;
            });
        } else if (data.type === 'div' && data.style?.includes('navbarhoriz')) {
            element.addEventListener("click", () => {
                this.openAddBtnNav = true;
                this.openText = false;
                this.openNavbarElement = true;
                this.isButtonNavBar = true;
                this.isButtonActive = false;
                this.openSettings = true;
                this.openStyleSection = true;
                this.openStyleText = false;
                this.activeElement = data.id;
                this.backgroundColorInputSettingsValue = element.style.backgroundColor;
                this.TS_DesactiveElements();
                element.style.borderColor = "rgb(255, 0, 72)";
                this.draggableElement(element);
                this.openControlsTable = false;
            });
        }

        this.draggableElement(element);
    });
}


  

  TS_GenerateCode(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  TS_DesactiveElements() {

    const activeElements = document.querySelectorAll('.text, input, button');
    activeElements.forEach((element) => {
      (element as HTMLElement).style.borderColor = 'transparent';
    });
  }
  TS_SaveElement(id: string, type: string) {
    console.log(`Saving element ${id} of type ${type}`);
  }

  TS_ReadImage(e: any) {
    const file = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = (event: any) => {
      const imageDataUrl = event.target.result;
      this.TS_AddImageToFrame(imageDataUrl);
      this.TS_SaveAllElements(); // Sauvegarde les éléments après avoir ajouté l'image
    };
    fileReader.readAsDataURL(file);
  }
  TS_AddImageToFrame(src: any) {
    this.element = document.querySelector(".frame");
    const img = document.createElement("img");
    const container = document.createElement("div");
    img.src = src;
    img.setAttribute("style", `
      width:100%;
      height:100%;
      object-fit: cover;
    `);
    container.setAttribute("style", `
      position:absolute;
      width:120px;
      height:100px;
    `);
    img.setAttribute("class", "img");
    container.id = this.TS_GenerateCode(4);
    img.addEventListener("click", () => {
      this.openText = false;
      this.openNavbarElement = false;
      this.isButtonNavBar = false;
      this.isButtonActive = false;
      this.openFramesListe = false;
      this.openSettings = false;
      this.activeElement = container.id;
      this.TS_DesactiveElements();
      this.draggableElement(container);
      this.openControlsTable = false;
    });
    container.appendChild(img);
    this.element.appendChild(container);
    this.TS_SaveElement(container.id, 'img');
    this.TS_SaveAllElements(); // Sauvegarde les éléments après avoir ajouté l'image
  }

  TS_FillFrameContent() {
    this.element = document.querySelector(".frame")
    for (let i = 0; i < this.framesList.length; i++) {
      if (this.framesList[i].key === this.activeframe) {
        this.framesList[i].content = this.element.innerHTML
      }
    }
    setTimeout(this.TS_FillFrameContent.bind(this), 50)
  }
 
  TS_AddNavbarHorizontale(frame: HTMLElement) {
    this.activeframe = this.sharedService.getActiveFrame();
    console.log('Active frame:', this.activeframe);

    // Crée l'élément de barre de navigation
    const navbar = document.createElement("div");
    navbar.setAttribute("style", `position:absolute;
      width:50%;
      height:50px;
      top:100px;
      left:400px;  
      background-color:#333;
      display:flex;
      justify-content:space-around;
      align-items:center;
      z-index: 10;`);
    navbar.setAttribute("class", "navbarhoriz");
    navbar.id = this.TS_GenerateCode(4);

    console.log('Navbar created with ID:', navbar.id);

    // Function to update the navbar with buttons
    const updateNavBarButtons = () => {
        console.log('Updating NavBar buttons...');
        const buttons = this.navbarservice.getNavBarButtons().filter(button => button.navbarId === navbar.id);
        console.log('Buttons for this NavBar:', buttons);
        navbar.innerHTML = ''; // Clear existing buttons
        buttons.forEach(button => {
            const btn = document.createElement("button");
            btn.innerText = button.label;
            btn.id = button.id;

            // Add click event listener to each button
            btn.addEventListener("click", () => {
                console.log(`Button clicked: ${button.label} (ID: ${button.id})`);
                this.navbarservice.setNavBarBtnClicked(true);

                
            });

            navbar.appendChild(btn);
            console.log(`Button added to NavBar: ${button.label} (ID: ${button.id})`);
        });
    };

    // Subscribe to changes in the NavBarService
    this.navbarservice.activeNavBar$.subscribe(activeNavBarId => {
        console.log('Active NavBar changed:', activeNavBarId);
        if (activeNavBarId === navbar.id) {
            updateNavBarButtons();
        }
    });

    navbar.addEventListener("click", () => {
        console.log('NavBar clicked, ID:', navbar.id);
        this.openText = false;
        this.openNavbarElement = true;
        this.isButtonNavBar = true;
        this.isButtonActive = false;
        this.openFramesListe = false;
        this.sharedService.setOpenSettings(false);
        this.sharedService.setOpenSettingsNavBar(true);
        this.sharedService.setOpenSettingsInput(false);
        this.sharedService.setOpenFormFrameEdit(false);
        this.sharedService.setButtonClicked(false);
        this.navbarservice.setActiveNavBar(navbar.id);
        this.TS_DesactiveElements();
        navbar.style.borderColor = "#ff0048";
        this.draggableElement(navbar);
        this.openControlsTable = false;
        updateNavBarButtons(); // Initial update when navbar is clicked
    });

    frame.appendChild(navbar);
    console.log('NavBar appended to frame:', frame);

    this.sharedService.addElement({ id: navbar.id, idframe: this.activeframe, type: 'navbarhoriz', content: '', style: navbar.getAttribute('style') });
    this.TS_SaveAllElements();

  
    this.navbarservice.NavBarBtnClicked$.subscribe(value => {
        this.isButtonNavBar = value;
        console.log('isButtonNavBar:', this.isButtonNavBar);
    });
}

  
  TS_AddTableToFrame(frame: any) {


    this.TableService.addTable(this.websiteId!);

    const container = document.createElement("div")
    const table = document.createElement("table")
    const thead = document.createElement("thead")
    const cols = document.createElement("tr")
    const tbody = document.createElement("tbody")
    const addRowsBtn = document.createElement("button")
    const addColsBtn = document.createElement("button")
    const importXLBtn = document.createElement("button")
    const exportXLBtn = document.createElement("button")
    addRowsBtn.setAttribute("class", "btn btn-primary btnaddtableevent")
    addColsBtn.setAttribute("class", "btn btn-primary btnaddtableevent")
    importXLBtn.setAttribute("class", "btn btn-success btnaddtableevent btnexcel importXl")
    exportXLBtn.setAttribute("class", "btn btn-success btnaddtableevent btnexcel exportXl")
    addRowsBtn.innerText = "Ajouter ligne"
    addColsBtn.innerText = "Ajouter colone"
    exportXLBtn.innerText = "Export to excel"
    importXLBtn.innerText = "Import excel"
    container.id = this.TS_GenerateCode(4)
    addRowsBtn.id = "addrowbtn-" + container.id
    addColsBtn.id = "addcolbtn-" + container.id
    container.setAttribute("style", `
      position: absolute;
      width: 700px;
      over
      top: 30px;
      left: 40px;
      user-select: none;
      background-color: #f8f9fa;
    `)
    table.setAttribute("class", "table table-light")
    cols.id = container.id + "-cols"
    cols.setAttribute("style", "text-align:center")
    cols.innerHTML = `<th scope="col"></th>`
    tbody.id = container.id + "-rows"
    tbody.setAttribute("style", "text-align:center")
    thead.appendChild(cols)
    table.appendChild(thead)
    table.appendChild(tbody)
    addRowsBtn.addEventListener("click", () => {
      this.TS_initTableRows()
      this.openFormrow = true
    })
    addColsBtn.addEventListener("click", () => {
      this.openFormcol = true
    })
    container.appendChild(addColsBtn)
    container.appendChild(addRowsBtn)
    container.appendChild(exportXLBtn)
    container.appendChild(importXLBtn)
    table.id = this.TS_GenerateCode(5)
    exportXLBtn.id = table.id + "-export"
    importXLBtn.id = table.id + "-import"
    exportXLBtn.addEventListener("click", () => {
      this.controlElement = exportXLBtn
    })
    importXLBtn.addEventListener("click", () => {
      this.controlElement = importXLBtn
    })
    container.appendChild(table)
    container.addEventListener("click", () => {

      this.openText = false
      this.openNavbarElement = false
      this.isButtonNavBar = false
      this.isButtonActive = false
      this.openFramesListe = false
      this.openSettings = true
      this.openTableSetts = true
      this.activeElement = container.id
      this.TS_DesactiveElements()
      draggableElement(container.id)
      this.openControlsTable = true
    })
    frame.appendChild(container)
  }
  TS_initTableRows() {
    this.rowsFormData = []
    this.element = document.querySelector("#" + this.activeElement + "-cols")
    for (let i = 0; i < this.element.childNodes.length; i++) {
      if (this.element.childNodes[i].innerText !== "") {
        this.rowsFormData.push({
          title: this.element.childNodes[i].innerText,
          value: ""
        })
      }
    }
    console.log(this.rowsFormData)
  }

  TS_SaveWebsite() {
    this.element = document.querySelector(".frame")
    if (this.element.childNodes) {
      for (let i = 0; i < this.element.childNodes.length; i++) {
        this.element.childNodes[i].style.cursor = "default"
      }
    }
    const request = {
      title: this.websiteName
    }
    this.websiteservice.update(this.route.snapshot.params['id'], request).subscribe({
      next: (res: any) => {
        alert('saved successfully')
        for (let i = 0; i < this.framesList.length; i++) {
          this.TS_UpdateFrame(this.framesList[i])
        }
      }
    })
  }

  TS_UpdateFrame(frame: any) {
    const request = {
      content: frame.content,
    }
    this.frameservice.update(frame.id, request).subscribe({
      next: (res: any) => {
      }
    })
  }
  TS_AddBtn(frame: HTMLElement) {
    const button = this.renderer.createElement('button');

    const text = this.renderer.createText(this.btnvaleur);

    this.renderer.appendChild(button, text);
    this.renderer.setStyle(button, 'position', 'absolute');
    this.renderer.setStyle(button, 'font-size', '2vw');
    this.renderer.setStyle(button, 'cursor', 'pointer');
    this.renderer.setStyle(button, 'padding', '1%');
    this.renderer.setStyle(button, 'border', '.1vw solid transparent');
    this.renderer.setStyle(button, 'color', 'black');
    this.renderer.setStyle(button, 'width', '150px');
    this.renderer.setStyle(button, 'height', '50px');
    this.renderer.setStyle(button, 'z-index', '10');
    this.renderer.setStyle(button, 'top', '100px');
    this.renderer.setStyle(button, 'left', '300px');
    button.id = this.TS_GenerateCode(4);
    //tu peux extracter l'id
    this.CBtnid=button.id;
    this.draggableElement(button);
    this.renderer.listen(button, 'click', () => {
      // Ajoutez ici la logique à exécuter lors du clic sur le bouton
      console.log('Button clicked');
      this.handleButtonClick(button);
    });
    this.sharedService.setOpenSettings(false);
    this.sharedService.setOpenSettingsInput(false);
    this.renderer.appendChild(frame, button);
    this.TS_SaveElement(button.id, 'button');
    this.TS_SaveAllElements();
    console.log(this.btnvaleur);
  }

  handleButtonClick(button: HTMLElement) {
    //developpement des fonctionnalités
    this.sharedService.setButtonClicked(true);
    console.log('Button clicked', button);
  }

  private updateButton() {
    // Trouvez le bouton existant dans le DOM
    if (this.CBtnid) {
      const button = document.getElementById(this.CBtnid);

      if (button) {
        // Mettez à jour le texte du bouton avec la valeur actuelle de btnvaleur
        this.renderer.setProperty(button, 'textContent', this.btnvaleur);
      } else {
        console.log('Button with ID not found:', this.CBtnid);
      }
    } else {
      console.log('No button ID available');
    }
  }
  goBack(): void {
    this.sharedService.clearStorage();
    this.location.back();
  }
}
