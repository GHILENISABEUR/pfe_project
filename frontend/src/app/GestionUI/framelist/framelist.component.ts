import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FrameService } from '../../services/frame.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { WebsiteService } from '../../services/website.service';
import { FrameElemntService } from '../../services/frame-elemnt.service';
import { SharedService } from 'src/app/services/shared-services.service';
import { NavBarService } from 'src/app/services/nav-bar.service';

declare function draggableElement(id: any): void
interface ElementData {
  id: string;
  idframe: string|null;
  type: string;
  content: string;
  style: string | null;
}
interface FrameData {
  id: string;
  key: string;
  title: string;
  event: string;
  content: string;
  route: string;
}
@Component({
  selector: 'app-framelist',
  templateUrl: './framelist.component.html',
  styleUrls: ['./framelist.component.css']
})
export class FramelistComponent implements OnInit {
  frames: FrameData[];
  colors = [
    "#ff0000",  // Red
    "#00ff00",  // Green
    "#0000ff",  // Blue
    "#ffff00",  // Yellow
    "#ff00ff",  // Magenta
    "#00ffff",  // Cyan
    "#800080",  // Purple
    "#008000",  // Dark Green
    "#800000",  // Maroon
    "#008080",  // Teal
    "#ff4500",  // Orange Red
    "#ff8c00",  // Dark Orange
    "#ff69b4",  // Hot Pink
    "#483d8b",  // Dark Slate Blue
    "#800000",   // Dark Red,
   
  ]

  openBgPicker = false
  openTextPicker = false
  idActiveframe: any
  openSideBar = false
  numbersArray: any = []
  element: any
  element1: any
  element2: any
  websiteName = ''
  openSettings = false
  contentFrame = ''
  activeElement = ""
  titleFrame = ""
  textInputSettingsValue = ""
  sizeInputSettingsValue = "1"
  contentHtml: any
  colorInputSettingsValue = "rgb(255, 0, 72)"
  backgroundColorInputSettingsValue = "rgb(255, 0, 72)"
  openStyleSection = false
  openStyleText = false
  textCodeValue = ''
  openTextCode = false
  openFormFrameEdit = false
  openFramesListe = false
  framesList: any = []
  activeframe: any
  idActiveElement: any
  frameDetails = new FormGroup({
    title: new FormControl('', [Validators.required]),
    route: new FormControl('', [Validators.required])
  })
  elements: any = []
  textCodeEvent = ""
  frameContent = ""
  isButtonActive = false
  openTextCodeButton = false
  isButtonNavBar = false
  openNavbarElement = false
  openText = false
  openAddBtnNav = false
  routeBtn = "--- select route"
  openTableSetts = false
  rowsFormData: any = []
  openFormrow = false
  openFormcol = false
  openControlsTable = false
  columnToUpdate: any
  openFormrowUpdate = false
  controlElement: any

  constructor(private navbarservice:NavBarService,private sharedService: SharedService,private frameservice: FrameService, private route: ActivatedRoute, private sanitizer: DomSanitizer, private websiteservice: WebsiteService, private elementservice: FrameElemntService) { this.frames=[]}


  ngOnInit(): void {
  
    this.sharedService.frames$.subscribe(frames => {
      this.frames = frames;
    });
    console.log(this.frames)
  
   this.activeframe="null"
    
    
    for (let i = 1; i <= 100; i++) {
      this.numbersArray.push(i.toString());
    }
    
    this.TS_SetStylePositionElement()
  }

  TS_SetStylePositionElement() {
    this.element = document.querySelector(".frame")
    if (this.element.childNodes) {
      for (let i = 0; i < this.element.childNodes.length; i++) {
        if (this.element.childNodes[i].style.left.includes("px")) {
          this.element.childNodes[i].style.left = (parseInt(this.element.childNodes[i].style.left.replace("px", "")) / this.element.offsetWidth) * 100 + "%"
        }
        if (this.element.childNodes[i].style.top.includes("px")) {
          this.element.childNodes[i].style.top = (parseInt(this.element.childNodes[i].style.top.replace("px", "")) / this.element.offsetHeight) * 100 + "%"
        }
        if (this.element.childNodes[i].style.width.includes("px")) {
          this.element.childNodes[i].style.width = (parseInt(this.element.childNodes[i].style.width.replace("px", "")) / this.element.offsetWidth) * 100 + "%"
        }
        if (this.element.childNodes[i].style.height.includes("px")) {
          this.element.childNodes[i].style.height = (parseInt(this.element.childNodes[i].style.height.replace("px", "")) / this.element.offsetHeight) * 100 + "%"
        }
      }
    }
    setTimeout(this.TS_SetStylePositionElement.bind(this), 500);
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

  TS_GetFrames() {
    const frames = this.sharedService.getFrames();
    
    console.log(frames);
    this.framesList=frames;
  }
  
  TS_GenerateCode(length: any) {
    const numbers = 'azertyuiopqsdfghjklmwxcvbnAZERTYUIOPMLKJHGFDQSWXCVBN'
    var result = ''
    for (var i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * numbers.length)
      result += numbers.charAt(index)
    }
    return result
  }

  TS_SelectFrame(frame: any) {
    this.activeframe = frame.key;
    this.sharedService.setActiveFrame(this.activeframe);
    console.log(this.activeframe);
    this.sharedService.setFrameClicked(true);
    this.sharedService.setOpenFormFrameEdit(true);
    this.frameDetails.setValue({
        title: frame.title,
        route: frame.route,
    });
    this.textCodeValue = frame.event;
    this.element = document.querySelector(".frame");
    this.element.innerHTML = frame.content;

    setTimeout(() => {
        const elementsData: ElementData[] = JSON.parse(localStorage.getItem('frameElements') || '[]');
        console.log("All Elements Data: ", elementsData);
        
        // Ajout du log pour vérifier la valeur de frame.id
        console.log("Frame ID: ", this.activeframe);

        this.elements = this.sharedService.getElements().filter(element => (element.idframe === this.activeframe || element.idframe===null));
    
        console.log("Filtered Elements: ", this.elements);

        

        this.elements.forEach((elementData: ElementData) => {
            const element = document.createElement(elementData.type);

            if (elementData.type === 'text') {
                (element as HTMLParagraphElement).innerText = elementData.content;
            } else if (elementData.type === 'img') {
                (element as HTMLImageElement).src = elementData.content;
            } else if (elementData.type === 'input') {
                (element as HTMLInputElement).value = elementData.content;
            } else if (elementData.type === 'div' && elementData.style?.includes('navbarhoriz')) {
                // Check if the element is a navbar
                element.innerHTML = elementData.content;
            }

            element.setAttribute('style', elementData.style ?? '');
            element.id = elementData.id;
            this.element.appendChild(element);

            element.addEventListener("click", (e: any) => {
                switch (elementData.type) {
                    case "text":
                        this.openText = true;
                        this.openNavbarElement = false;
                        this.isButtonNavBar = false;
                        this.isButtonActive = false;
                        this.openFramesListe = false;
                        this.sharedService.setOpenFormFrameEdit(true);
                        this.sizeInputSettingsValue = (parseInt(element.style.fontSize.replace("vw", "")) * 10) + "";
                        this.textInputSettingsValue = element.innerText;
                        this.colorInputSettingsValue = element.style.color;
                        this.activeElement = elementData.id;
                        this.TS_DesactiveElements();
                        this.draggableElement(element);
                        this.openControlsTable = false;
                        break;
                    case "button":
                        this.openAddBtnNav = false;
                        this.openText = true;
                        this.isButtonNavBar = true;
                        this.isButtonActive = true;
                        this.sharedService.setOpenFormFrameEdit(true);
                        this.openStyleSection = true;
                        this.openStyleText = true;
                        this.backgroundColorInputSettingsValue = element.style.backgroundColor;
                        this.routeBtn = element.getAttribute("navid") + "";
                        this.colorInputSettingsValue = element.style.color;
                        this.textInputSettingsValue = element.innerText;
                        this.activeElement = elementData.id;
                        this.TS_DesactiveElements();
                        this.openControlsTable = false;
                        break;
                    case "section":
                        if (e.target.id === elementData.id) {
                            this.openAddBtnNav = true;
                            this.openText = false;
                            this.openNavbarElement = true;
                            this.isButtonNavBar = false;
                            this.isButtonActive = false;
                            this.openSettings = true;
                            this.openStyleSection = true;
                            this.openStyleText = false;
                            this.activeElement = elementData.id;
                            this.backgroundColorInputSettingsValue = element.style.backgroundColor;
                            this.TS_DesactiveElements();
                            element.style.borderColor = "rgb(255, 0, 72)";
                            this.draggableElement(element);
                            this.openControlsTable = false;
                        }
                        break;
                    case "image":
                        this.openAddBtnNav = false;
                        this.openText = false;
                        this.openNavbarElement = false;
                        this.isButtonNavBar = false;
                        this.isButtonActive = false;
                        this.openSettings = true;
                        this.openStyleSection = false;
                        this.openStyleText = false;
                        this.activeElement = elementData.id;
                        this.TS_DesactiveElements();
                        this.draggableElement(element);
                        this.openControlsTable = false;
                        break;
                    case "div":
                        if (elementData.style?.includes('navbarhoriz')) {
                            this.openAddBtnNav = true;
                            this.openText = false;
                            this.openNavbarElement = true;
                            this.isButtonNavBar = true;
                            this.isButtonActive = false;
                            this.openSettings = true;
                            this.openStyleSection = true;
                            this.openStyleText = false;
                            this.activeElement = elementData.id;
                            this.backgroundColorInputSettingsValue = element.style.backgroundColor;
                            this.TS_DesactiveElements();
                            element.style.borderColor = "rgb(255, 0, 72)";
                            this.draggableElement(element);
                            this.openControlsTable = false;
                        }
                        break;
                }
            });
        });
    }, 700);
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
    this.sharedService.saveElements(this.elements); // Sauvegarder la position après déplacement
  };

  const closeDragElement = () => {
    document.onmouseup = null;
    document.onmousemove = null;
  };
}
  TS_DesactiveElements() {
    this.element = document.querySelector(".frame")
    if (this.element.childNodes) {
      for (let i = 0; i < this.element.childNodes.length; i++) {
        this.element.childNodes[i].style.borderColor = "transparent"
      }
    }
  }


  TS_AddFrame() {
    const webSiteId = this.sharedService.getWebSiteId();
    const request = {
        id: this.TS_GenerateCode(5),
        key: this.TS_GenerateCode(5),
        title: 'new frame',
        event: '',
        content: '',
        route: '',
        webSiteId: webSiteId
    };

    // Add the new frame
    this.sharedService.addFrame(request);
    this.frameservice.create(request).subscribe({
        next: (res: any) => {
            // Fetch the updated list of frames
            this.TS_GetFrames();

            // Check if the newly created frame has a navbar
            const existingNavbar = this.sharedService.getElements().find(element => element.type === 'navbarhoriz' && element.idframe === request.id);

            // If no navbar exists, create one
            if (!existingNavbar) {
                // Assuming the frame's HTML element is available and accessible here
                const frameElement = document.getElementById(`frame-${request.id}`);
                if (frameElement) {
                    this.TS_AddNavbarHorizontale(frameElement);
                } else {
                    console.warn(`Frame element with ID frame-${request.id} not found.`);
                }
            }
        },
        error: (err: any) => {
            console.error('Error creating frame:', err);
        }
    });
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
    

  
    this.navbarservice.NavBarBtnClicked$.subscribe(value => {
        this.isButtonNavBar = value;
        console.log('isButtonNavBar:', this.isButtonNavBar);
    });
}

}
