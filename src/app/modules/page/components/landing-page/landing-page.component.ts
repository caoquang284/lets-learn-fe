import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private observer!: IntersectionObserver;
  showScrollButton = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    // Initialize Intersection Observer for scroll animations
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before element is fully visible
      }
    );

    // Listen for scroll events to show/hide scroll button
    window.addEventListener('scroll', this.onWindowScroll.bind(this));
  }

  ngAfterViewInit() {
    // Observe all elements with 'animate-on-scroll' class
    const elements = this.elementRef.nativeElement.querySelectorAll('.animate-on-scroll');
    elements.forEach((element: Element) => {
      this.observer.observe(element);
    });
  }

  ngOnDestroy() {
    // Clean up observer
    if (this.observer) {
      this.observer.disconnect();
    }
    // Remove scroll event listener
    window.removeEventListener('scroll', this.onWindowScroll.bind(this));
  }

  // Handle window scroll event
  onWindowScroll() {
    // Show button when user scrolls down 300px from top
    this.showScrollButton = window.pageYOffset > 300;
  }

  // Scroll to top smoothly
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
