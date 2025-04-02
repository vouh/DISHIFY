document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const mainContent = document.querySelector('.main-content');
    const dropdownIcons = document.querySelectorAll('.dropdown-icon');

    // Toggle sidebar when clicking the toggle button
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
        mainContent.classList.add('sidebar-active');
    });

    // Close sidebar when clicking the close button
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
        mainContent.classList.remove('sidebar-active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('sidebar-active');
        }
    });

    // Handle dropdown icon clicks
    dropdownIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = this.closest('.has-sublist');
            
            // Close other open sublists
            document.querySelectorAll('.has-sublist.active').forEach(item => {
                if (item !== parentItem) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current sublist
            parentItem.classList.toggle('active');
        });
    });

    // Prevent sublist toggle when clicking nav-item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.classList.contains('dropdown-icon')) {
                e.preventDefault();
            }
        });
    });
}); 



document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const mainContent = document.querySelector('.main-content');
    const navItems = document.querySelectorAll('.has-sublist');

    // Toggle sidebar when clicking the toggle button
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
        mainContent.classList.add('sidebar-active');
    });

    // Close sidebar when clicking the close button
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
        mainContent.classList.remove('sidebar-active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('sidebar-active');
        }
    });

    // Handle sublist toggles
    navItems.forEach(item => {
        const navItem = item.querySelector('.nav-item');
        
        // Handle click events only
        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close other open sublists
            navItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current sublist
            item.classList.toggle('active');
        });
    });
}); 