import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { injectContent, MarkdownComponent } from '@analogjs/content';

import BookAttributes from '../../book-attributes';

@Component({
  selector: 'app-book',
  imports: [AsyncPipe, MarkdownComponent],
  template: `
    @if (book$ | async; as book) {
    <article>
      <img class="book__image" [src]="book.attributes.coverImage" />
      <analog-markdown [content]="book.content" />
    </article>
    }
  `,
  styles: `
    .book__image {
      max-height: 40vh;
    }
  `,
})
export default class Book {
  readonly book$ = injectContent<BookAttributes>('slug');
}
