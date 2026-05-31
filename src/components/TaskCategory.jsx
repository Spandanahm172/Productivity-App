import './TaskCategory.css';

export function TaskCategory({ title, children, actions }) {
   return (
      <div className="categoryCard">
         <div className="categoryHeader">
            <div className="categoryTitle">
               {title}
            </div>
            {actions && <div className="categoryActions">{actions}</div>}
         </div>
         <div className="categoryContent">
            {children}
         </div>
      </div>
   );
}
