import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FrameService } from '../../services/frame.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { WebsiteService } from '../../services/website.service';
import { FrameElemntService } from '../../services/frame-elemnt.service';
import { SharedService } from 'src/app/services/shared-services.service';
import { NavBarService } from 'src/app/services/nav-bar.service';
import { TableService } from 'src/app/services/table.service'; 
import { v4 as uuidv4 } from 'uuid';

declare function draggableElement(id: any): void
interface NavBarButton {
  id: string;
  label: string;
  navbarId: string | null;
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
  selector: 'app-parametre',
  templateUrl: './parametre.component.html',
  styleUrls: ['./parametre.component.css']
})
export class ParametreComponent implements OnInit {

  colors = [
    "#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#800080","#008000","#800000","#008080","#ff4500","#ff8c00","#ff69b4","#483d8b","#800000",]

  openBgPicker = false
  openTextPicker = false
  idActiveframe: any
  openSideBar = false
  numbersArray: any = []
  element: any
  element1: any
  element2: any
  websiteName = ''
  openSettingsText = false
  openSettingsInput=false
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
  selectedAction:string = 'ajouter'
  openSettingsNavBar = false;
  navBarButtons: NavBarButton[] = [];
  activeNavBarId: string  ="null";
 frames:FrameData[];
 selectedFrame!:FrameData|null
 selectedFrameId: string | null = null;
  constructor(public TableService:TableService,private navbarservice:NavBarService,private sharedService: SharedService,private frameservice: FrameService, private route: ActivatedRoute, private sanitizer: DomSanitizer, private websiteservice: WebsiteService, private elementservice: FrameElemntService) { this.frames=[]}


  ngOnInit(): void {
    this.navbarservice.NavBarBtnClicked$.subscribe(value=>{
      this.isButtonNavBar=value;
    })
    this.sharedService.openFormFrameEdit$.subscribe(value => {
      this.openFormFrameEdit = value;
      console.log(this.openFormFrameEdit)
    });
   this.activeframe=this.sharedService.getActiveFrame()
   
    this.sharedService.openSettings$.subscribe(value => {
      this.openSettingsText = value
    });
    this.sharedService.openSettingsInput$.subscribe(value => {
      this.openSettingsInput = value
    });
    this.sharedService.openSettings$.subscribe(value => {
      this.openText = value
    });
    this.sharedService.openSettingsNavBar$.subscribe(value => {
      this.openSettingsNavBar = value;
      console.log(this.openSettingsNavBar)
    });
    this.activeNavBarId=this.navbarservice.getActiveNavBar();
    this.navBarButtons = this.navbarservice.getNavBarButtons().filter(button => button.navbarId === this.activeNavBarId);
    this.sharedService.frames$.subscribe(frames => {
      this.frames = frames;
    });
    this.TS_FillFrameContent();

    for (let i = 1; i <= 100; i++) {
      this.numbersArray.push(i.toString());
    }

    this.TS_GetFrames();
    this.TS_SetStylePositionElement();

    this.sharedService.activeElement$.subscribe((element) => {
      if (element) {
        this.activeElement = element.id;
        console.log("l'id="+this.activeElement);
        this.textInputSettingsValue = element.content;

        if (element.style) {
          const style = element.style;
          this.colorInputSettingsValue = style.color || "rgb(255, 0, 72)";
          this.backgroundColorInputSettingsValue = style.backgroundColor || "rgb(255, 0, 72)";
        }
      } else {
        console.error('Active element is null or undefined');
      }
    });

    this.sharedService.buttonClicked$.subscribe(value => {
      this.isButtonActive = value;
    });

    this.sharedService.selectedAction$.subscribe(value => {
      this.selectedAction = value;
    });
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
  TS_GetFrames() {
    this.framesList = []
    this.websiteservice.getById(this.route.snapshot.params['id']).subscribe({
      next: (res: any) => {
        this.websiteName = res.title
        this.frameservice.getAll().subscribe({

          next: (r: any) => {

             this.contentHtml=this.sanitizer.bypassSecurityTrustHtml( res.content);
            for (let i = 0; i < r.length; i++) {
              console.log(r[i].webSiteId, this.route.snapshot.params['id'])

              if (r[i].webSiteId == this.route.snapshot.params['id']) {
                this.framesList.push(r[i])
              }

            }
            console.log(this.framesList)
          }
        })
      }
    })


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
  TS_SetBtnRouteToFrame(route: any) {
    this.element = document.querySelector("#" + this.activeElement)
    console.log(this.element)
    this.element.setAttribute("class", "nav-bar-btn")
    this.element.setAttribute("navid", route.target.value)
    this.routeBtn = "--- select route"
  }
  TS_SaveFrameDetails() {
    this.activeframe = this.sharedService.getActiveFrame();
    console.log(this.activeframe);
    
    const request = {
      title: this.frameDetails.value.title ?? '',
      route: this.frameDetails.value.route ?? '',
    };
  
    this.frameservice.update(this.activeframe, request).subscribe({
      next: (res: any) => {
        console.log(res);
        this.TS_GetFrames();
        alert('frame updated');
      },
    });
    
    this.sharedService.updateFrame(this.activeframe, request);
  }
  

  TS_DeleteFrame() {
    this.frameservice.delete(this.idActiveframe).subscribe({
      next: (res: any) => {
        this.element = document.querySelector(".frame")
        this.element.innerHTML = ""
        console.log(res)
        alert('fram deleted')
        this.openFormFrameEdit = false
        this.TS_GetFrames()
      }
    })


  }

  TS_DeleteInput() {
    if (this.activeElement) {
      const element = document.getElementById(this.activeElement);
      if (element) {
        element.remove();
        this.sharedService.removeElement(this.activeElement); // Update the state or service if necessary
        this.activeElement = "null"; // Clear the active element ID
        this.sharedService.setActiveElement(null); // Update the shared service
      } else {
        console.error(`Element with ID ${this.activeElement} not found.`);
      }
    } else {
      console.error('No active element set.');
    }
  }


TS_SetBackgroundColor(color: string) {
  if (!this.activeElement) {
    console.error('Active element is not defined');
    return;
  }
  this.element = document.querySelector("#" + this.activeElement);
  if (this.element) {
    this.element.style.backgroundColor = color;
    this.sharedService.updateElement(this.activeElement, {
      style: this.element.getAttribute('style') 
    });
  } else {
    console.error('Element not found:', this.activeElement);
  }
}

  
  TS_ChangeTextColor(color: string) {
    if (!this.activeElement) {
      console.error('Active element is not defined');
      return;
    }
    
    this.element = document.querySelector("#" + this.activeElement);
    if (this.element) {
      this.element.style.color = color;
      this.sharedService.updateElement(this.activeElement, {style: this.element.getAttribute('style') 
      });
    } else {
      console.error('Element not found:', this.activeElement);
    }
  }

  TS_SetTextToElement(text: any) {
    if (!this.activeElement) {
      console.error('Active element is not defined');
      return;
    }
    this.element = document.querySelector("#" + this.activeElement);
    if (this.element) {
      this.element.innerText = text.target.value;
      this.sharedService.updateElement(this.activeElement, { innerText: text.target.value });
    } else {
      console.error('Element not found:', this.activeElement);
    }
  }

TS_RemoveElement() {
  this.sharedService.removeElement(this.activeElement);
}

updateElementSettings() {
  if (this.activeElement) {
    const element = document.querySelector("#" + this.activeElement);
    if (element instanceof HTMLElement) {
      element.innerHTML = this.textInputSettingsValue;
      element.style.color = this.colorInputSettingsValue;
      element.style.border=".1vw solid #000000";
      element.style.backgroundColor = this.backgroundColorInputSettingsValue;
      this.sharedService.updateElement(this.activeElement, {
        content: this.textInputSettingsValue,
        style: element.getAttribute('style')
      });
    } else {
      console.error('Element not found or does not have expected type:', this.activeElement);
    }
  } else {
    console.error('Active element is not defined');
  }
}
onComboBoxChange(event: any) {
  const selectedValue = event.target.value;
  this.sharedService.setSelectedAction(selectedValue);
  console.log('ComboBox value changed:', selectedValue);

}
addButtonToNavBar(): void {
  const newButton: NavBarButton = {
      id: uuidv4(), // génère un identifiant unique
      label: 'New Button',
      navbarId: this.navbarservice.getActiveNavBar() // associe le bouton à la navbar active
  };

  console.log('Adding button with label:', newButton.label, 'to NavBar with ID:', newButton.navbarId);

  this.navBarButtons.push(newButton);
  this.navbarservice.addNavBarButton(newButton);

  // Manually trigger updateNavBarButtons to refresh the navbar UI
  const activeNavBarId = this.navbarservice.getActiveNavBar();
  if (activeNavBarId) {
      const navbar = document.getElementById(activeNavBarId);
      if (navbar) {
          const updateNavBarButtons = () => {
              console.log('Updating NavBar buttons...');
              const buttons = this.navbarservice.getNavBarButtons().filter(button => button.navbarId === activeNavBarId);
              console.log('Buttons for this NavBar:', buttons);
              navbar.innerHTML = ''; // Clear existing buttons
              buttons.forEach(button => {
                  const btn = document.createElement("button");
                  btn.innerText = button.label;
                  btn.id = button.id;

                  btn.addEventListener("click", () => {
                     this.navbarservice.setNavBarBtnClicked(true)
                   
                  });
                  this.navbarservice.NavBarBtnClicked$.subscribe(value => {
                    this.isButtonNavBar = value;
                    this.navbarservice.setActiveNavBar(btn.id)
                    console.log(btn.id)
                    console.log('isButtonNavBar:', this.isButtonNavBar);
                });
                  navbar.appendChild(btn);
                  console.log(`Button added to NavBar: ${button.label} (ID: ${button.id})`);
              });
          };
          updateNavBarButtons();
      }
     
  }
}
TS_Relier_btn_frame(): void {
  const buttonId = this.navbarservice.getActiveNavBarBtn();
  
  // Vérifiez si buttonId est null
  if (!buttonId) {
    console.error('No active NavBar button ID found.');
    return;
  }

  console.log("Le bouton ID: " + buttonId);

  if (!this.selectedFrameId) {
    console.error('No frame selected');
    return;
  }

  const selectedFrame = this.frames.find(frame => frame.key === this.selectedFrameId);
  if (!selectedFrame) {
    console.error('Selected frame not found');
    return;
  }

  // Mettez à jour le bouton avec le titre du frame sélectionné
  const updates: Partial<NavBarButton> = {
    label: selectedFrame.title
  };

  this.navbarservice.updateNavBarButton(buttonId, updates);
  console.log('Button updated with new label:', updates.label);

  const activeNavBarId = this.navbarservice.getActiveNavBar();
  if (activeNavBarId) {
    const navbar = document.getElementById(activeNavBarId);
    if (navbar) {
      const updateNavBarButtons = () => {
        console.log('Updating NavBar buttons...');
        const buttons = this.navbarservice.getNavBarButtons().filter(button => button.navbarId === activeNavBarId);
        console.log('Buttons for this NavBar:', buttons);
        navbar.innerHTML = ''; // Clear existing buttons
        buttons.forEach(button => {
          const btn = document.createElement('button');
          btn.innerText = button.label;
          btn.id = button.id;

          btn.addEventListener('click', () => {
            this.navbarservice.setNavBarBtnClicked(true);
            console.log(`Button clicked: ${button.label} (ID: ${button.id})`);
          });

          navbar.appendChild(btn);
          console.log(`Button added to NavBar: ${button.label} (ID: ${button.id})`);
        });
      };
      updateNavBarButtons();
    } else {
      console.error('NavBar element not found');
    }
  } else {
    console.error('Active NavBar ID not found');
  }
}


}
