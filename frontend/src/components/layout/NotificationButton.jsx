import { Bell } from 'lucide-react'

function NotificationButton({ count = 3 }) {
  return (
    <button className="relative hover:text-primary transition-colors">
      <Bell className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}

export default NotificationButton

