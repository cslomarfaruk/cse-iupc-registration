'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  MapPin, 
  Award, 
  DollarSign 
} from 'lucide-react'
import { formatDate } from '@/utils/date'

export default function EventCard({ event }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl 
        hover:shadow-emerald-700/20 dark:hover:shadow-purple-600/30"
    >
      <div className="relative">
        {event.image && (
          <div className="h-56 overflow-hidden">
            <Image 
              src={event.image} 
              alt={event.title} 
              fill
              className="object-cover transition-all duration-300 
                hover:scale-105"
              onError={(e) => {
                e.target.src = "/api/placeholder/600/300";
                e.target.alt = "Event Preview";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b 
              from-transparent to-black/50"></div>
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-extrabold text-white mb-2">
          {event.title}
        </h3>
        <div className="text-gray-400 text-sm line-clamp-3">
          {event.description}
        </div>
        <div className="flex flex-col gap-2 text-gray-300">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-purple-400" />
            <span className="font-medium">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="text-purple-400" />
            <span className="font-medium">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="text-yellow-400" />
            <span className="font-medium text-emerald-400">
              Prize: {event.prizeMoney}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="text-purple-400" />
            <span className="font-medium text-rose-400">
              Entry Fee: {event.fee}
            </span>
          </div>
        </div>
        <Link 
          href={`/events/${event.slug}`}
          className="w-full block py-3 text-center 
            bg-gradient-to-r from-emerald-600 to-green-600 
            hover:bg-gradient-to-l hover:shadow-lg 
            text-white font-semibold rounded-lg 
            shadow-emerald-600/40 transition-all duration-300"
        >
          <span className="relative ">
            Explore Event
          </span>
        </Link>
      </div>
    </motion.div>
  )
}