import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';

import BookAttributes from '../../book-attributes';

@Component({
  selector: 'app-books',
  imports: [RouterLink],
  template: `
    <h1>Books Archive</h1>

    @for (book of books; track book.attributes.slug) {
    <a [routerLink]="['/books/', book.attributes.slug]">
      <h2 class="book__title">{{ book.attributes.title }}</h2>
      <p class="book__desc">{{ book.attributes.description }}</p>
    </a>
    }
  `,
  styles: `
    a {
      text-align: left;
      display: block;
      margin-bottom: 2rem;
    }

    .book__title,
    .book__desc {
      margin: 0;
    }
  `,
})
export default class Books {
  readonly books = injectContentFiles<BookAttributes>();
}
