export interface ScheduleItem {
  id: string;
  time: string;
  titleKey: string;
  locationKey: string;
}

export function getScheduleForGroup(group: string): ScheduleItem[] {
  const validGroups = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"];
  const normalizedGroup = validGroups.includes(group) ? group : "A1";
  const isSessionB = normalizedGroup.startsWith("B");
  const numIndex = normalizedGroup.charAt(1);

  const timeline: ScheduleItem[] = [
    { id: "s-open", time: "09:45 - 10:30", titleKey: "home.schedule.open", locationKey: "home.schedule.lxAuditorium" },
  ];

  const stations = {
    S1: { title: "home.schedule.station1", location: "home.schedule.cb2301" },
    S2: { title: "home.schedule.station2", location: "home.schedule.cb2306" },
    S3: { title: "home.schedule.station3", location: "home.schedule.cb2304" },
    S4: { title: "home.schedule.station4", location: "home.schedule.cb2305" },
    S5: { title: "home.schedule.station5", location: "home.schedule.cb2312" }
  };

  const groupOrders: Record<string, (keyof typeof stations)[]> = {
    "1": ["S1", "S5", "S2", "S4", "S3"],
    "2": ["S2", "S4", "S3", "S1", "S5"],
    "3": ["S3", "S1", "S5", "S2", "S4"],
    "4": ["S4", "S3", "S1", "S5", "S2"],
    "5": ["S5", "S2", "S4", "S3", "S1"],
  };

  const getStationItems = (sessionB: boolean) => {
    const slots = sessionB 
      ? ["10:45 - 11:00", "11:05 - 11:20", "11:25 - 11:40", "11:45 - 12:00", "12:05 - 12:20"]
      : ["13:45 - 14:00", "14:05 - 14:20", "14:25 - 14:40", "14:45 - 15:00", "15:05 - 15:20"];
    
    const items: ScheduleItem[] = [];
    groupOrders[numIndex].forEach((stationKey, index) => {
      items.push({
        id: `s-station-${index}`,
        time: slots[index],
        titleKey: stations[stationKey].title,
        locationKey: stations[stationKey].location
      });
    });
    return items;
  };

  const getIceBreakingItems = (sessionB: boolean) => {
    const isFirstHalf = ["1", "2", "3"].includes(numIndex);
    const slots = sessionB
      ? ["13:40 - 13:55", "14:00 - 14:15"]
      : ["10:40 - 10:55", "11:00 - 11:15"];
    
    const items: ScheduleItem[] = [];
    if (isFirstHalf) {
      items.push({ id: "s-ice1", time: slots[0], titleKey: "home.schedule.iceBreaking1", locationKey: "home.schedule.lx2" });
      items.push({ id: "s-ice2", time: slots[1], titleKey: "home.schedule.iceBreaking2", locationKey: "home.schedule.lx3" });
    } else {
      items.push({ id: "s-ice2", time: slots[0], titleKey: "home.schedule.iceBreaking2", locationKey: "home.schedule.lx3" });
      items.push({ id: "s-ice1", time: slots[1], titleKey: "home.schedule.iceBreaking1", locationKey: "home.schedule.lx2" });
    }
    return items;
  };

  if (isSessionB) {
    timeline.push(...getStationItems(true));
    timeline.push({ id: "s-lunch", time: "12:20 - 13:15", titleKey: "home.schedule.lunch", locationKey: "home.schedule.lx10" });
    timeline.push({ id: "s-gather", time: "13:15 - 13:30", titleKey: "home.schedule.gather", locationKey: "home.schedule.lx3" });
    timeline.push(...getIceBreakingItems(true));
    timeline.push({ id: "s-snack", time: "14:15 - 14:25", titleKey: "home.schedule.snack", locationKey: "home.schedule.lx10" });
    timeline.push({ id: "s-talk", time: "14:25 - 15:25", titleKey: "home.schedule.talk", locationKey: "home.schedule.lx10" });
  } else {
    timeline.push(...getIceBreakingItems(false));
    timeline.push({ id: "s-snack", time: "11:15 - 11:25", titleKey: "home.schedule.snack", locationKey: "home.schedule.lx10" });
    timeline.push({ id: "s-talk", time: "11:25 - 12:25", titleKey: "home.schedule.talk", locationKey: "home.schedule.lx10" });
    timeline.push({ id: "s-lunch", time: "12:20 - 13:15", titleKey: "home.schedule.lunch", locationKey: "home.schedule.lx10" });
    timeline.push({ id: "s-gather", time: "13:15 - 13:30", titleKey: "home.schedule.gather", locationKey: "home.schedule.lx3" });
    timeline.push(...getStationItems(false));
  }

  timeline.push({ id: "s-close", time: "15:35 - 16:30", titleKey: "home.schedule.close", locationKey: "home.schedule.lxAuditorium" });

  return timeline;
}
