// @ts-nocheck
// GSAP's seamless vertical loop helper (https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/),
// lightly adapted: plugins are imported instead of read from globals.
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

export function verticalLoop(items, config): gsap.core.Timeline {
  let timeline;
  items = gsap.utils.toArray(items);
  config = config || {};
  gsap.context(() => {
    let onChange = config.onChange,
      lastIndex = 0,
      tl = gsap.timeline({repeat: config.repeat, onUpdate: onChange && function() {
          let i = tl.closestIndex();
          if (lastIndex !== i) {
            lastIndex = i;
            onChange(items[i], i);
          }
        }, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
      length = items.length,
      startY = items[0].offsetTop,
      times = [],
      heights = [],
      spaceBefore = [],
      yPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
      timeOffset = 0,
      container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalHeight,
      getTotalHeight = () => items[length-1].offsetTop + yPercents[length-1] / 100 * heights[length-1] - startY + spaceBefore[0] + items[length-1].offsetHeight * gsap.getProperty(items[length-1], "scaleY") + (parseFloat(config.paddingBottom) || 0),
      populateHeights = () => {
        let b1 = container.getBoundingClientRect(), b2;
        items.forEach((el, i) => {
          heights[i] = parseFloat(gsap.getProperty(el, "height", "px"));
          yPercents[i] = snap(parseFloat(gsap.getProperty(el, "y", "px")) / heights[i] * 100 + gsap.getProperty(el, "yPercent"));
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.top - (i ? b1.bottom : b1.top);
          b1 = b2;
        });
        gsap.set(items, {
          yPercent: i => yPercents[i]
        });
        totalHeight = getTotalHeight();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center ? tl.duration() * (container.offsetHeight / 2) / totalHeight : 0;
        center && times.forEach((t, i) => {
          times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * heights[i] / 2 / totalHeight - timeOffset);
        });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0, d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) {
            d = wrap - d;
          }
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curY, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curY = yPercents[i] / 100 * heights[i];
          distanceToStart = item.offsetTop + curY - startY + spaceBefore[0];
          distanceToLoop = distanceToStart + heights[i] * gsap.getProperty(item, "scaleY");
          tl.to(item, {yPercent: snap((curY - distanceToLoop) / heights[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
            .fromTo(item, {yPercent: snap((curY - distanceToLoop + totalHeight) / heights[i] * 100)}, {yPercent: yPercents[i], duration: (curY - distanceToLoop + totalHeight - curY) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateHeights();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable && tl.paused() ? tl.time(times[curIndex], true) : tl.progress(progress, true);
      },
      onResize = () => refresh(!(tl.draggable && tl.draggable.isDragging)),
      proxy;
    gsap.set(items, {y: 0});
    populateHeights();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", onResize);
    function toIndex(index, vars) {
      vars = vars || {};
      (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = {time: timeWrap};
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
    }
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = setCurrent => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex;
    tl.next = vars => toIndex(tl.current()+1, vars);
    tl.previous = vars => toIndex(tl.current()-1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    if (config.draggable && typeof(Draggable) === "function") {
      proxy = document.createElement("div")
      let wrap = gsap.utils.wrap(0, 1),
        ratio, startProgress, draggable, dragSnap, lastSnap, initChangeY, wasPlaying,
        align = () => tl.progress(wrap(startProgress + (draggable.startY - draggable.y) * ratio)),
        syncIndex = () => tl.closestIndex(true);
      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: "y",
        onPressInit() {
          let y = this.y;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalHeight;
          initChangeY = (startProgress / -ratio) - y;
          gsap.set(proxy, {y: startProgress / -ratio});
          if (+InertiaPlugin.version.split(".")[1] < 14) {
            let tracker = InertiaPlugin.getByTarget(proxy),
                pt = tracker && tracker._props.y;
            pt && (pt.v1 = pt.v2 = startProgress / -ratio);
          }
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          let time = -(value * ratio) * tl.duration(),
            wrappedTime = timeWrap(time),
            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
            dif = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          draggable.isThrowing && (indexIsDirty = true);
        },
        onThrowComplete: () => {
          syncIndex();
          wasPlaying && tl.play();
        }
      })[0];
      tl.draggable = draggable;
    }
    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    timeline = tl;
    return () => window.removeEventListener("resize", onResize);
  });
  return timeline;
}
