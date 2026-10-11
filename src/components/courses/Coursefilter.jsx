import { Search, SlidersHorizontal } from 'lucide-react';

const Coursefilter = ({ categories, selectedCategory, onCategoryChange, searchTerm, onSearchChange }) => (
  <section className="cc-course-controls" aria-label="Find courses">
    <label className="cc-course-search">
      <span className="sr-only">Search courses</span>
      <Search size={18} aria-hidden="true" />
      <input type="search" placeholder="Search courses or topics" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} />
      <kbd>⌘ K</kbd>
    </label>
    <div className="cc-course-filter-select">
      <SlidersHorizontal size={16} aria-hidden="true" />
      <label htmlFor="course-category">Field</label>
      <select id="course-category" value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)}>
        <option value="all">All categories</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
    </div>
    <div className="cc-course-chips" role="group" aria-label="Course categories">
      <button type="button" aria-pressed={selectedCategory === 'all'} className={selectedCategory === 'all' ? 'is-selected' : ''} onClick={() => onCategoryChange('all')}>All courses</button>
      {categories.map((category) => <button type="button" key={category.id} aria-pressed={selectedCategory === category.id} className={selectedCategory === category.id ? 'is-selected' : ''} onClick={() => onCategoryChange(category.id)}>{category.name}</button>)}
    </div>
  </section>
);

export default Coursefilter;
